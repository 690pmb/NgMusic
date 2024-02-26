import {Injectable} from '@angular/core';
import {
  Observable,
  catchError,
  filter,
  forkJoin,
  from,
  map,
  of,
  switchMap,
  take,
} from 'rxjs';
import * as xml2js from 'xml2js';
import JSZip from 'jszip';
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

  constructor(
    private dropboxService: DropboxService,
    private serviceUtils: UtilsService,
    private toast: ToastService
  ) {}

  loadsList(
    table: Table<T>,
    fileTable: Table<File>,
    dropboxFile: string
  ): Observable<boolean> {
    return forkJoin([
      from(fileTable.get(1)),
      this.dropboxService.files.obs$.pipe(take(1)),
    ]).pipe(
      switchMap(([storedName, filesList]) => {
        const fileNameToDownload = DataService.findsFileNameToDownload(
          dropboxFile,
          filesList
        );
        if (!fileNameToDownload && !storedName?.filename) {
          this.toast.open('No file to download or loaded');
          return of(true);
        } else if (fileNameToDownload && !storedName?.filename) {
          return this.downloadsList(
            table,
            fileTable,
            fileNameToDownload,
            `Download ${dropboxFile}`
          ).pipe(map(() => true));
        } else if (!fileNameToDownload && storedName) {
          this.toast.open('Already loaded');
          return of(true);
        } else {
          if (
            DataService.extractDateFromFilename(fileNameToDownload ?? '') >
            DataService.extractDateFromFilename(storedName?.filename ?? '')
          ) {
            return this.downloadsList(
              table,
              fileTable,
              fileNameToDownload ?? '',
              `Update ${dropboxFile}`
            ).pipe(map(() => true));
          } else {
            this.toast.open('Already loaded');
            return of(true);
          }
        }
      })
    );
  }

  private downloadsList(
    table: Table<T>,
    fileTable: Table<File>,
    fileName: string,
    resultMessage: string
  ): Observable<unknown> {
    // download file
    const t0 = performance.now();
    const zip: JSZip = new JSZip();
    return this.dropboxService.downloadFile(fileName).pipe(
      switchMap((content: string) => {
        this.toast.open(`File downloaded: ${fileName}`);
        return zip.loadAsync(content);
      }),
      map(content => Object.keys(content.files)[0]),
      filter((path): path is string => !!path),
      map(path => zip.file(path)),
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
        return of(null);
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

  private parse(xmlFile: string): T[] {
    let list: T[] = [];
    new xml2js.Parser().parseString(xmlFile, (err, result: unknown) => {
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
        }) as T[];
      } else if (isXC(result)) {
        list = result.Compositions.C.map(el => {
          const c = DataService.parseComposition(el);
          c.fileList = el.F.map(elFile =>
            DataService.parseFichier(elFile, false)
          );
          return c;
        }) as T[];
      }
    });
    return list;
  }

  private static parseComposition(
    compoXml: XWrapper<XComposition>
  ): Composition {
    return new Composition(
      compoXml.$.id,
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
    const name: string = fichierXml.$.name;
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
      const parsed = DataService.parseName(name);
      f.name = parsed.name;
      f.author = parsed.author;
      f.publish = +parsed.publish;
    } else {
      f.author = fichierXml.$.author;
      f.publish = +fichierXml.$.publish;
    }
    return f;
  }

  public static parseName(
    name: string
  ): Record<'author' | 'name' | 'publish', string> {
    return {
      name: name.substring(name.indexOf('-') + 1, name.lastIndexOf('-')).trim(),
      author: name.substring(0, name.indexOf('-')).trim(),
      publish: name.substring(name.lastIndexOf('-') + 1, name.length).trim(),
    };
  }

  private static findsFileNameToDownload(
    dropboxFile: string,
    filesList?: files.ListFolderResult
  ): string | undefined {
    const names =
      filesList?.entries
        .map(f => f.name)
        .filter(name => DataService.isCorrectFileName(name, dropboxFile)) ?? [];
    if (names.length === 0) {
      return undefined;
    } else if (names.length === 1) {
      return names[0];
    } else {
      const dateArray = names.map(name =>
        DataService.extractDateFromFilename(name)
      );
      const lastDate = dateArray.reduce((d1, d2) => (d1 > d2 ? d1 : d2));
      return names.find(name =>
        name.includes(lastDate.toFormat(DataService.dateFormat))
      );
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
