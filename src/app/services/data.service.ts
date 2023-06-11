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
import {XComposition, XFichier, XWrapper, isXF, isXC} from '../utils/xml';
import {DexieService} from './dexie.service';

@Injectable({
  providedIn: 'root',
})
export class DataService<T extends Composition | Fichier> {
  private static readonly dateFormat = 'YYYY-MM-DD HH-mm';

  done$ = new BehaviorSubject(false);

  constructor(
    private dropboxService: DropboxService,
    private serviceUtils: UtilsService,
    private toast: ToastService
  ) {}

  loadsList(
    table: Dexie.Table<T, number>,
    file: Dexie.Table<File, number>,
    dropboxFile: string
  ): void {
    Promise.all([
      file.get(1),
      this.dropboxService.listFiles(Dropbox.DROPBOX_FOLDER),
    ]).then(([storedName, filesList]) => {
      const fileNameToDownload = DataService.findsFileNameToDownload(
        filesList,
        dropboxFile
      );
      if (!fileNameToDownload && !storedName) {
        this.toast.open('No file to download or loaded');
        this.done$.next(true);
      } else if (fileNameToDownload && !storedName) {
        this.downloadsList(
          table,
          file,
          fileNameToDownload,
          `Download ${dropboxFile}`
        );
      } else if (!fileNameToDownload && storedName) {
        this.toast.open('Already loaded');
        this.done$.next(true);
      } else {
        if (
          DataService.extractDateFromFilename(fileNameToDownload).isAfter(
            DataService.extractDateFromFilename(storedName.filename)
          )
        ) {
          this.downloadsList(
            table,
            file,
            fileNameToDownload,
            `Update ${dropboxFile}`
          );
        } else {
          this.toast.open('Already loaded');
          this.done$.next(true);
        }
      }
    });
  }

  downloadsList(
    table: Dexie.Table<T, number>,
    fileTable: Dexie.Table<File, number>,
    fileName: string,
    resultMessage: string
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
          const dataList = this.parse(dataFromFile);
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
        DexieService.addAll(table, dataList);
        this.toast.open(resultMessage);
        this.done$.next(true);
      })
      .catch(err => this.serviceUtils.handlePromiseError(err));
  }

  parse(xmlFile: string): T[] {
    let list;
    new xml2js.Parser().parseString(xmlFile, (err, result) => {
      if (err) {
        console.error(err);
      }
      if (isXF(result)) {
        list = result.Fichiers.F.map(el => {
          const f = DataService.parseFichier(el, true);
          f.compoList = el.C.map(elCompo =>
            DataService.parseComposition(elCompo)
          );
          return f;
        });
      } else if (isXC(result)) {
        list = result.Compositions.C.map(el => {
          const c = DataService.parseComposition(el);
          c.fileList = el.F.map(elFile =>
            DataService.parseFichier(elFile, false)
          );
          return c;
        });
      }
    });
    return list;
  }

  private static parseComposition(
    compoXml: XWrapper<XComposition>
  ): Composition {
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

  private static parseFichier(
    fichierXml: XWrapper<XFichier>,
    splitName: boolean
  ): Fichier {
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

  private static findsFileNameToDownload(
    filesList: DropboxTypes.files.ListFolderResult,
    dropboxFile: string
  ): string {
    if (!filesList) {
      return undefined;
    }
    const names = filesList.entries
      .map(f => f.name)
      .filter(name => DataService.isCorrectFileName(name, dropboxFile));
    const count = names.length;
    if (count === 0) {
      return undefined;
    } else if (count === 1) {
      return names.find(name =>
        DataService.isCorrectFileName(name, dropboxFile)
      );
    } else {
      const dateArray = [];
      names.map(name => {
        if (DataService.isCorrectFileName(name, dropboxFile)) {
          dateArray.push(DataService.extractDateFromFilename(name));
        }
      });
      const lastDate = dateArray
        .reduce((d1, d2) => (d1.isAfter(d2) ? d1 : d2))
        .toDate();
      const fileToDownload = names.find(name =>
        name.includes(moment(lastDate).format(DataService.dateFormat))
      );
      return fileToDownload;
    }
  }

  private static extractDateFromFilename(filename: string): moment.Moment {
    const isComma = filename.indexOf(';');
    const isXml = filename.indexOf(Dropbox.DROPBOX_EXTENTION);
    return moment(
      filename.substring(isComma + 1, isXml),
      DataService.dateFormat
    );
  }

  private static isCorrectFileName(name: string, dropboxFile: string): boolean {
    return (
      name.includes(dropboxFile) && name.includes(Dropbox.DROPBOX_EXTENTION)
    );
  }
}
