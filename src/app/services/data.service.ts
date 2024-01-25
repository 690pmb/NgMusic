import {Injectable} from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  catchError,
  filter,
  forkJoin,
  from,
  map,
  of,
  switchMap,
} from 'rxjs';
import * as xml2js from 'xml2js';
import * as JSZip from 'jszip';
import {files} from 'dropbox';

import {DropboxService} from './dropbox.service';
import {UtilsService} from './utils.service';
import {Composition, Fichier, File} from '@utils/model';
import {Table} from '@utils/table';
import {ToastService} from './toast.service';
import {Dropbox} from '@utils/dropbox';
import {XComposition, XFichier, XWrapper, isXF, isXC} from '@utils/xml';
import {DateTime} from 'luxon';

@Injectable({
  providedIn: 'root',
})
export class DataService<T extends Composition | Fichier> {
  private static readonly dateFormat = 'y-MM-dd HH-mm';

  done$ = new BehaviorSubject(false);

  constructor(
    private dropboxService: DropboxService,
    private serviceUtils: UtilsService,
    private toast: ToastService
  ) {}

  loadsList(table: Table<T>, file: Table<File>, dropboxFile: string): void {
    forkJoin([
      from(file.get(1)),
      this.dropboxService.listFiles(Dropbox.DROPBOX_FOLDER),
    ]).subscribe(([storedName, filesList]) => {
      const fileNameToDownload = DataService.findsFileNameToDownload(
        dropboxFile,
        filesList
      );
      if (!fileNameToDownload && !storedName?.filename) {
        this.toast.open('No file to download or loaded');
        this.done$.next(true);
      } else if (fileNameToDownload && !storedName?.filename) {
        this.downloadsList(
          table,
          file,
          fileNameToDownload,
          `Download ${dropboxFile}`
        ).subscribe();
      } else if (!fileNameToDownload && storedName) {
        this.toast.open('Already loaded');
        this.done$.next(true);
      } else {
        if (
          DataService.extractDateFromFilename(fileNameToDownload ?? '') >
          DataService.extractDateFromFilename(storedName?.filename ?? '')
        ) {
          this.downloadsList(
            table,
            file,
            fileNameToDownload ?? '',
            `Update ${dropboxFile}`
          ).subscribe();
        } else {
          this.toast.open('Already loaded');
          this.done$.next(true);
        }
      }
    });
  }

  downloadsList(
    table: Table<T>,
    fileTable: Table<File>,
    fileName: string,
    resultMessage: string
  ): Observable<void> {
    // download file
    const t0 = performance.now();
    const zip: JSZip = new JSZip();
    return this.dropboxService.downloadFile(fileName).pipe(
      switchMap((content: string) => {
        this.toast.open(`File downloaded: ${fileName}`);
        return zip.loadAsync(content);
      }),
      map(content => zip.file(Object.keys(content.files)[0])),
      filter((data): data is JSZip.JSZipObject => !!data),
      switchMap(data => data.async('string')),
      map((dataFromFile: string | undefined) => {
        if (dataFromFile && dataFromFile.trim().length > 0) {
          // Parse file
          const dataList = this.parse(dataFromFile);
          const t1 = performance.now();
          console.warn(`Call took ${(t1 - t0) / 1000} seconds`);
          return dataList;
        } else {
          return [];
        }
      }),
      switchMap(dataList =>
        this.updateTables(fileTable, fileName, table, dataList)
      ),
      map(() => {
        this.toast.open(resultMessage);
        this.done$.next(true);
        of(undefined);
      }),
      catchError(err =>
        this.serviceUtils.handleError(err, `Error when downloading ${fileName}`)
      )
    );
  }

  private updateTables(
    fileTable: Table<File>,
    fileName: string,
    table: Table<T>,
    dataList: T[]
  ): Observable<void> {
    this.toast.open('Data parsed');
    return fileTable.get(1).pipe(
      switchMap(item => {
        if (!item) {
          return fileTable.add({filename: fileName});
        } else {
          return fileTable.update(1, {filename: fileName});
        }
      }),
      switchMap(() => table.clear()),
      switchMap(() => table.addAll(dataList))
    );
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
    dropboxFile: string,
    filesList: files.ListFolderResult
  ): string | undefined {
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
      const dateArray: DateTime[] = [];
      names.map(name => {
        if (DataService.isCorrectFileName(name, dropboxFile)) {
          dateArray.push(DataService.extractDateFromFilename(name));
        }
      });
      const lastDate = dateArray.reduce((d1, d2) => (d1 > d2 ? d1 : d2));
      const fileToDownload = names.find(name =>
        name.includes(lastDate.toFormat(DataService.dateFormat))
      );
      return fileToDownload;
    }
  }

  private static extractDateFromFilename(filename: string): DateTime {
    const isComma = filename.indexOf(';');
    const isXml = filename.indexOf(Dropbox.DROPBOX_EXTENTION);
    return DateTime.fromFormat(
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
