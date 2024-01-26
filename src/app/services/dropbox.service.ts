import {Injectable} from '@angular/core';
import {Dropbox, files} from 'dropbox';
import {UtilsService} from './utils.service';
import {Dropbox as DropboxConstant} from '@utils/dropbox';
import {Observable, catchError, from, map, switchMap} from 'rxjs';

@Injectable({providedIn: 'root'})
export class DropboxService {
  constructor(private serviceUtils: UtilsService) {}

  static getDbx(): Dropbox {
    return new Dropbox({
      accessToken: DropboxConstant.DROPBOX_TOKEN,
    });
  }

  static getPath(fileName: string): string {
    return DropboxConstant.DROPBOX_FOLDER + fileName;
  }

  listFiles(folder: string): Observable<files.ListFolderResult> {
    return from(DropboxService.getDbx().filesListFolder({path: folder})).pipe(
      map(response => response.result),
      catchError(err =>
        this.serviceUtils.handleError(err, 'Error when listing files')
      )
    );
  }

  downloadFile(fileName: string): Observable<string> {
    return from(
      DropboxService.getDbx().filesDownload({
        path: DropboxService.getPath(fileName),
      })
    ).pipe(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      switchMap((response: any) => {
        const fileReader = new FileReader();
        return new Observable<string>(observer => {
          fileReader.onerror = () => {
            fileReader.abort();
            observer.error(new DOMException('Problem parsing input file.'));
          };
          fileReader.onload = () =>
            observer.next(fileReader?.result?.toString() ?? '');
          fileReader.onloadend = () => observer.complete();
          fileReader.readAsBinaryString(response.result.fileBlob);
        });
      }),
      catchError(err =>
        this.serviceUtils.handleError(
          err,
          `Error when downloading file ${fileName}`
        )
      )
    );
  }
}
