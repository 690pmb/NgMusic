import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import * as xml2js from 'xml2js';
import * as moment from 'moment-mini-ts';
import Dexie from 'dexie';
import * as JSZip from 'jszip';
import DropboxTypes from 'dropbox';

import {DropboxService} from './dropbox.service';
import {UtilsService} from './utils.service';
import {Composition, Fichier, File} from '../utils/model';
import {ToastService} from './toast.service';
import {Dropbox} from '../utils/dropbox';

type CompositionOrFichier<T extends Composition | Fichier> =
  T extends Composition ? Composition : Fichier;

@Injectable({
  providedIn: 'root',
})
export class DataService {
  doneComposition$ = new BehaviorSubject(false);
  doneFichier$ = new BehaviorSubject(false);
  dateFormat = 'YYYY-MM-DD HH-mm';

  constructor(
    private dropboxService: DropboxService,
    private serviceUtils: UtilsService,
    private toast: ToastService
  ) {}

  loadsList<T extends Composition | Fichier>(
    table: Dexie.Table<CompositionOrFichier<T>, number>,
    file: Dexie.Table<File, number>,
    dropboxFile: string,
    isComposition: boolean
  ): void {
    Promise.all([
      file.get(1),
      this.dropboxService.listFiles(Dropbox.DROPBOX_FOLDER),
    ]).then(([storedName, filesList]) => {
      const fileNameToDownload = this.findsFileNameToDownload(
        filesList,
        dropboxFile
      );
      if (!fileNameToDownload && !storedName) {
        this.toast.open('No file to download or loaded');
        this.done(isComposition);
      } else if (fileNameToDownload && !storedName) {
        this.downloadsList(
          table,
          file,
          fileNameToDownload,
          `Download ${dropboxFile}`,
          isComposition
        );
      } else if (!fileNameToDownload && storedName) {
        this.toast.open('Already loaded');
        this.done(isComposition);
      } else {
        if (
          this.extractDateFromFilename(fileNameToDownload).isAfter(
            this.extractDateFromFilename(storedName.filename)
          )
        ) {
          this.downloadsList(
            table,
            file,
            fileNameToDownload,
            `Update ${dropboxFile}`,
            isComposition
          );
        } else {
          this.toast.open('Already loaded');
          this.done(isComposition);
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

  addAll<T>(table: Dexie.Table<T, number>, data: T[]): Promise<void> {
    return table
      .bulkAdd(data)
      .then(() => console.warn(`Done adding ${data.length} datas`))
      .catch(Dexie.BulkError, e => {
        // Explicitely catching the bulkAdd() operation makes those successful
        // additions commit despite that there were errors.
        console.error(
          `Some items did not succeed. However, ${
            data.length - e.failures.length
          } items was added successfully`
        );
      });
  }

  update<T>(
    table: Dexie.Table<T, number>,
    id: number,
    data: T
  ): Promise<number> {
    return table.update(id, data);
  }

  remove<T>(table: Dexie.Table<T, number>, id: number): Promise<void> {
    return table.delete(id);
  }

  downloadsList<T extends Composition | Fichier>(
    table: Dexie.Table<CompositionOrFichier<T>, number>,
    fileTable: Dexie.Table<File, number>,
    fileName: string,
    resultMessage: string,
    isComposition: boolean
  ): Promise<void> {
    // download file
    const t0 = performance.now();
    const zip: JSZip = new JSZip();
    return this.dropboxService
      .downloadFile(fileName)
      .then((content: string) => {
        this.toast.open(`File downloaded: ${fileName}`);
        return zip.loadAsync(content);
      })
      .then(content => zip.file(Object.keys(content.files)[0]).async('string'))
      .then((dataFromFile: string) => {
        if (dataFromFile && dataFromFile.trim().length > 0) {
          // Parse file
          const dataList = this.parseData(dataFromFile, isComposition);
          const t1 = performance.now();
          console.warn(`Call took ${(t1 - t0) / 1000} seconds`);
          return dataList;
        } else {
          return [];
        }
      })
      .then((dataList: (Composition | Fichier)[]) => {
        this.toast.open('Data parsed');
        fileTable.get(1).then(item => {
          if (!item) {
            fileTable.add({filename: fileName});
          } else {
            fileTable.update(1, {filename: fileName});
          }
        });
        table.clear();
        this.addAll(table, dataList);
        this.toast.open(resultMessage);
        this.done(isComposition);
      })
      .catch(err => this.serviceUtils.handlePromiseError(err));
  }

  parseData(
    dataFromFile: string,
    isComposition: boolean
  ): (Composition | Fichier)[] {
    if (isComposition) {
      return this.parseCompositions(dataFromFile);
    } else {
      return this.parseFichiers(dataFromFile);
    }
  }

  parseCompositions(compoFromFile: string): Composition[] {
    const compoList = [];
    new xml2js.Parser().parseString(compoFromFile, (err, result) => {
      if (err) {
        console.error(err);
      }
      result.Compositions.C.forEach(el => {
        const c = this.parseComposition(el);
        c.fileList = el.F.map(elFile => this.parseFichier(elFile, false));
        compoList.push(c);
      });
    });
    return compoList;
  }

  parseFichiers(fichierFromFile: string): Fichier[] {
    const fichierList = [];
    new xml2js.Parser().parseString(fichierFromFile, (err, result) => {
      if (err) {
        console.error(err);
      }
      result.Fichiers.F.forEach(el => {
        const f = this.parseFichier(el, true);
        f.compoList = el.C.map(elCompo => this.parseComposition(elCompo));
        fichierList.push(f);
      });
    });
    return fichierList;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private parseComposition(compoXml: any): Composition {
    return new Composition(
      compoXml.$.A,
      compoXml.$.T,
      compoXml.$.type,
      compoXml.$.del,
      compoXml.$.sA,
      compoXml.$.sT,
      compoXml.$.score,
      compoXml.$.size,
      compoXml.$.decile,
      compoXml.$.rank
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private parseFichier(fichierXml: any, splitName: boolean): Fichier {
    let name: string = fichierXml.$.name;
    const f = new Fichier(
      fichierXml.$.cat,
      fichierXml.$.creation,
      name,
      fichierXml.$.rangeB,
      fichierXml.$.rangeE,
      fichierXml.$.rank,
      fichierXml.$.size,
      fichierXml.$.sorted,
      fichierXml.$.type
    );
    if (splitName && !fichierXml.$.author) {
      const author = name.substring(0, name.indexOf('-'));
      const publish = name.substring(name.lastIndexOf('-') + 1, name.length);
      name = name.substring(name.indexOf('-') + 1, name.lastIndexOf('-'));
      f.name = name;
      f.author = author;
      f.publish = +publish;
    } else {
      f.author = fichierXml.$.author;
      f.publish = +fichierXml.$.publish;
    }
    return f;
  }

  private findsFileNameToDownload(
    filesList: DropboxTypes.files.ListFolderResult,
    dropboxFile: string
  ): string {
    if (!filesList) {
      return undefined;
    }
    const names = filesList.entries
      .map(f => f.name)
      .filter(name => this.isCorrectFileName(name, dropboxFile));
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
      const lastDate = dateArray
        .reduce((d1, d2) => (d1.isAfter(d2) ? d1 : d2))
        .toDate();
      const fileToDownload = names.find(name =>
        name.includes(moment(lastDate).format(this.dateFormat))
      );
      return fileToDownload;
    }
  }

  private extractDateFromFilename(filename: string): moment.Moment {
    const isComma = filename.indexOf(';');
    const isXml = filename.indexOf(Dropbox.DROPBOX_EXTENTION);
    return moment(filename.substring(isComma + 1, isXml), this.dateFormat);
  }

  private isCorrectFileName(name: string, dropboxFile: string): boolean {
    return (
      name.includes(dropboxFile) && name.includes(Dropbox.DROPBOX_EXTENTION)
    );
  }

  private done(isCompilation: boolean): void {
    if (isCompilation) {
      this.doneComposition$.next(true);
    } else {
      this.doneFichier$.next(true);
    }
  }
}
