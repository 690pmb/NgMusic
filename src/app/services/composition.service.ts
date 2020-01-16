import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as xml2js from 'xml2js';
import * as moment from 'moment-mini-ts';
import Dexie from 'dexie';
import Zip from 'jszip';

import { DropboxService } from './dropbox.service';
import { UtilsService } from './utils.service';
import { Composition, Fichier } from '../utils/model';
import { DexieService } from './dexie.service';
import { ToastService } from './toast.service';
import { Dropbox } from '../utils/dropbox';

@Injectable({
  providedIn: 'root'
})
export class CompositionService {
  parser = new xml2js.Parser();
  table: Dexie.Table<Composition, number>;
  importedFile: Dexie.Table<any, number>;
  done$ = new BehaviorSubject(false);
  dateFormat = 'YYYY-MM-DD HH-mm';
  zip = new Zip();

  constructor(
    private dropboxService: DropboxService,
    private serviceUtils: UtilsService,
    private dexieService: DexieService,
    private toast: ToastService
  ) {
    this.table = this.dexieService.table('composition');
    this.importedFile = this.dexieService.table('importedFile');
  }

  loadsCompositionList(): void {
    Promise.all([
      this.importedFile.get(1),
      this.dropboxService.listFiles(Dropbox.DROPBOX_FOLDER)
    ]).then(([storedName, filesList]) => {
      const fileNameToDownload = this.findsFileNameToDownload(filesList);
      if (!fileNameToDownload && !storedName) {
        this.toast.open('No file to download or loaded');
        return;
      } else if (fileNameToDownload && !storedName) {
        this.downloadsCompositionList(fileNameToDownload, 'Download Compositions');
      } else if (!fileNameToDownload && storedName) {
        this.toast.open('Already loaded');
        this.done$.next(true);
      } else {
        if (this.extractDateFromFilename(fileNameToDownload).isAfter(this.extractDateFromFilename(storedName.filename))) {
          this.downloadsCompositionList(fileNameToDownload, 'Update Composition');
        } else {
          this.toast.open('Already loaded');
          this.done$.next(true);
        }
      }
    });
  }

  getAll(): Promise<Composition[]> {
    return this.table.toArray();
  }

  add(data: Composition): Promise<number> {
    return this.table.add(data);
  }

  addAll(data: Composition[]): void {
    this.table.bulkAdd(data).then((lastKey) => {
      console.log(`Done adding ${data.length} compositions`);
      console.log('Last composition id was: ' + lastKey);
    }).catch(Dexie.BulkError, (e) => {
      // Explicitely catching the bulkAdd() operation makes those successful
      // additions commit despite that there were errors.
      console.error(`Some composition did not succeed. However, ${data.length - e.failures.length} compositions was added successfully`);
    });
  }

  update(id: number, data: Composition): Promise<number> {
    return this.table.update(id, data);
  }

  remove(id: number): Promise<void> {
    return this.table.delete(id);
  }

  parseCompostion(compoXml: any): Composition {
    const c = new Composition(compoXml.$.A, compoXml.$.T, compoXml.$.type, compoXml.$.del,
      compoXml.$.sA, compoXml.$.sT, compoXml.$.score, compoXml.$.size, compoXml.$.decile);
    c.fileList = this.parseFichierList(compoXml.F);
    return c;
  }

  parseFichierList(fichierXml: any[]): Fichier[] {
    const fileList = [];
    fichierXml.forEach((elFile: any) => {
      const fichier = new Fichier(elFile.$.cat, elFile.$.creation, elFile.$.name, elFile.$.rangeB, elFile.$.rangeE, elFile.$.rank, elFile.$.size, elFile.$.sorted);
      fileList.push(fichier);
    });
    return fileList;
  }

  downloadsCompositionList(fileName: string, resultMessage: string): void {
    // download file
    const t0 = performance.now();
    this.dropboxService.downloadFile(fileName)
      .then((content: string) => this.zip.loadAsync(content))
      .then(content => this.zip.file(Object.keys(content.files)[0]).async('string'))
      .then((compoFromFile: string) => {
        if (compoFromFile && compoFromFile.trim().length > 0) {
          const compoList = [];
          // Parse file
          this.parser.parseString(compoFromFile, (err, result) => {
            result.Compositions.C.forEach(el => {
              compoList.push(this.parseCompostion(el));
            });
            const t1 = performance.now();
            console.log('Call to doSomething took ' + (t1 - t0) / 1000 + ' seconds');
          });
          return compoList;
        } else {
          return [];
        }
      }).then((compoList: Composition[]) => {
        this.importedFile.get(1).then(item => {
          if (!item) {
            this.importedFile.add({ filename: fileName });
          } else {
            this.importedFile.update(1, { filename: fileName });
          }
        });
        this.table.clear();
        this.addAll(compoList);
        this.toast.open(resultMessage);
        this.done$.next(true);
      }).catch(err => this.serviceUtils.handlePromiseError(err));
  }

  findsFileNameToDownload(filesList: any): string {
    if (!filesList) {
      return undefined;
    }
    const names = filesList.entries.map(f => f.name);
    const count = names.filter(name => this.isCorrectFileName(name)).length;
    if (count === 0) {
      return undefined;
    } else if (count === 1) {
      return names.find(name => this.isCorrectFileName(name));
    } else {
      const dateArray = [];
      names.map(name => {
        if (this.isCorrectFileName(name)) {
          dateArray.push(this.extractDateFromFilename(name));
        }
      });
      const lastDate = dateArray.reduce((d1, d2) => d1.isAfter(d2) ? d1 : d2).toDate();
      const fileToDownload = names.find(name => name.includes(moment(lastDate).format(this.dateFormat)));
      console.log('fileToDownload', fileToDownload);
      return fileToDownload;
    }
  }

  extractDateFromFilename(filename: string): moment.Moment {
    const ixComma = filename.indexOf(';');
    const ixXml = filename.indexOf(Dropbox.DROPBOX_FINAL_EXTENTION);
    return moment(filename.substring(ixComma + 1, ixXml), this.dateFormat);
  }

  isCorrectFileName(name: string): boolean {
    return name.includes(Dropbox.DROPBOX_FINAL_FILE) && name.includes(Dropbox.DROPBOX_FINAL_EXTENTION);
  }
}
