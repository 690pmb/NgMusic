import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as xml2js from 'xml2js';
import * as moment from 'moment-mini-ts';
import Dexie from 'dexie';
import Zip from 'jszip';

import { DropboxService } from './dropbox.service';
import { UtilsService } from './utils.service';
import { Composition, Fichier } from '../utils/model';
import { ToastService } from './toast.service';
import { Dropbox } from '../utils/dropbox';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  doneComposition$ = new BehaviorSubject(false);
  doneFichier$ = new BehaviorSubject(false);
  dateFormat = 'YYYY-MM-DD HH-mm';

  constructor(
    private dropboxService: DropboxService,
    private serviceUtils: UtilsService,
    private toast: ToastService
  ) {
  }

  loadsList<T>(table: Dexie.Table<T, number>, file: Dexie.Table<any, number>, dropboxFile: string, isCompilation: boolean): void {
    Promise.all([
      file.get(1),
      this.dropboxService.listFiles(Dropbox.DROPBOX_FOLDER)
    ]).then(([storedName, filesList]) => {
      const fileNameToDownload = this.findsFileNameToDownload(filesList, dropboxFile);
      if (!fileNameToDownload && !storedName) {
        this.toast.open('No file to download or loaded');
        this.done(isCompilation);
      } else if (fileNameToDownload && !storedName) {
        this.downloadsList(table, file, fileNameToDownload, 'Download ' + dropboxFile, isCompilation);
      } else if (!fileNameToDownload && storedName) {
        this.toast.open('Already loaded');
        this.done(isCompilation);
      } else {
        if (this.extractDateFromFilename(fileNameToDownload).isAfter(this.extractDateFromFilename(storedName.filename))) {
         this.downloadsList(table, file, fileNameToDownload, 'Update ' + dropboxFile, isCompilation);
        } else {
          this.toast.open('Already loaded');
          this.done(isCompilation);
        }
      }
    });
  }

  getAll<T>(table: Dexie.Table<T, number>): Promise<T[]> {
    return table.toArray();
  }

  add<T>(table: Dexie.Table<T, number>, data: T): Promise<number> {
    return table.add(data);
  }

  addAll<T>(table: Dexie.Table<T, number>, data: T[]): Promise<number> {
    return table.bulkAdd(data).then((lastKey) => {
      console.log(`Done adding ${data.length} datas`);
      console.log('Last data id was: ' + lastKey);
      return lastKey;
    }).catch(Dexie.BulkError, (e) => {
      // Explicitely catching the bulkAdd() operation makes those successful
      // additions commit despite that there were errors.
      console.error(`Some items did not succeed. However, ${data.length - e.failures.length} items was added successfully`);
      return 0;
    });
  }

  update<T>(table: Dexie.Table<T, number>, id: number, data: T): Promise<number> {
    return table.update(id, data);
  }

  remove<T>(table: Dexie.Table<T, number>, id: number): Promise<void> {
    return table.delete(id);
  }

  downloadsList<T>(table: Dexie.Table<T, number>, fileTable: Dexie.Table<any, number>,
    fileName: string, resultMessage: string, isCompilation: boolean): Promise<any> {
    // download file
    const t0 = performance.now();
    const zip = new Zip();
    return this.dropboxService.downloadFile(fileName)
      .then((content: string) => {
        this.toast.open('File downloaded: ' + fileName);
        return zip.loadAsync(content);
      })
      .then(content => zip.file(Object.keys(content.files)[0]).async('string'))
      .then((dataFromFile: string) => {
        if (dataFromFile && dataFromFile.trim().length > 0) {
          // Parse file
          const dataList = this.parseData(dataFromFile, isCompilation);
          const t1 = performance.now();
          console.log('Call took ' + (t1 - t0) / 1000 + ' seconds');
          return dataList;
        } else {
          return [];
        }
      })
      .then((dataList: T[]) => {
        this.toast.open('Data parsed');
        fileTable.get(1).then(item => {
          if (!item) {
            fileTable.add({ filename: fileName });
          } else {
            fileTable.update(1, { filename: fileName });
          }
        });
        table.clear();
        this.addAll(table, dataList);
        this.toast.open(resultMessage);
        this.done(isCompilation);
      }).catch(err => this.serviceUtils.handlePromiseError(err));
  }

  parseData(dataFromFile: string, isCompilation: boolean): any[] {
    if (isCompilation) {
      return this.parseCompositions(dataFromFile);
    } else {
      return this.parseFichiers(dataFromFile);
    }
  }

  parseCompositions(compoFromFile: string): Composition[] {
    const compoList = [];
    new xml2js.Parser().parseString(compoFromFile, (err, result) => {
      result.Compositions.C.forEach(el => {
        const c = this.parseComposition(el);
        c.fileList = el.F.map((elFile: any) => this.parseFichier(elFile, false));
        compoList.push(c);
      });
    });
    return compoList;
  }

  parseFichiers(fichierFromFile: string): Fichier[] {
    const fichierList = [];
    new xml2js.Parser().parseString(fichierFromFile, (err, result) => {
      result.Fichiers.F.forEach(el => {
        const f = this.parseFichier(el);
        f.compoList = el.C.map((elCompo: any) => this.parseComposition(elCompo));
        fichierList.push(f);
      });
    });
    return fichierList;
  }

  private parseComposition(compoXml: any): Composition {
    return new Composition(compoXml.$.A, compoXml.$.T, compoXml.$.type, compoXml.$.del,
      compoXml.$.sA, compoXml.$.sT, compoXml.$.score, compoXml.$.size, compoXml.$.decile);
  }

  parseFichier(fichierXml: any): Fichier {
    return new Fichier(fichierXml.$.cat, fichierXml.$.creation, fichierXml.$.name,
      fichierXml.$.rangeB, fichierXml.$.rangeE, fichierXml.$.rank, fichierXml.$.size, fichierXml.$.sorted);
  }

  private findsFileNameToDownload(filesList: any, dropboxFile: string): string {
    if (!filesList) {
      return undefined;
    }
    const names = filesList.entries.map(f => f.name).filter(name => this.isCorrectFileName(name, dropboxFile));
    const count = names.length;
    if (count === 0) {
      return undefined;
    } else if (count === 1) {
      return names.find(name => this.isCorrectFileName(name, dropboxFile));
    } else {
      const dateArray = [];
      names.map(name => {
        if (this.isCorrectFileName(name, dropboxFile)) {
          dateArray.push(this.extractDateFromFilename(name));
        }
      });
      const lastDate = dateArray.reduce((d1, d2) => d1.isAfter(d2) ? d1 : d2).toDate();
      const fileToDownload = names.find(name => name.includes(moment(lastDate).format(this.dateFormat)));
      console.log('fileToDownload', fileToDownload);
      return fileToDownload;
    }
  }

  private extractDateFromFilename(filename: string): moment.Moment {
    const isComma = filename.indexOf(';');
    const isXml = filename.indexOf(Dropbox.DROPBOX_EXTENTION);
    return moment(filename.substring(isComma + 1, isXml), this.dateFormat);
  }

  private isCorrectFileName(name: string, dropboxFile: string): boolean {
    return name.includes(dropboxFile) && name.includes(Dropbox.DROPBOX_EXTENTION);
  }

  private done(isCompilation: boolean) {
    if (isCompilation) {
      this.doneComposition$.next(true);
    } else {
      this.doneFichier$.next(true);
    }
  }
}
