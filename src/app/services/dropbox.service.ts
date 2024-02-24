import {Injectable} from '@angular/core';
import {Dropbox, files} from 'dropbox';
import {UtilsService} from './utils.service';
import {Dropbox as DropboxConstant} from '@utils/dropbox';
import {Observable, catchError, from, map, switchMap} from 'rxjs';
import {Reactive} from '../utils/reactive';

@Injectable({providedIn: 'root'})
export class DropboxService {
  files = new Reactive<files.ListFolderResult>();

  constructor(private serviceUtils: UtilsService) {
    this.listFiles().subscribe(f => this.files.set(f));
  }

  static getDbx(): Dropbox {
    return new Dropbox({
      accessToken: DropboxConstant.DROPBOX_TOKEN,
    });
  }

  static getPath(fileName: string): string {
    return DropboxConstant.DROPBOX_FOLDER + fileName;
  }

  private listFiles(): Observable<files.ListFolderResult> {
    return from(
      DropboxService.getDbx().filesListFolder({
        path: DropboxConstant.DROPBOX_FOLDER,
      })
    ).pipe(
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
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
