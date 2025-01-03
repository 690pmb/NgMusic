import {Injectable} from '@angular/core';
import {Dropbox, DropboxResponseError, files} from 'dropbox';
import {UtilsService} from './utils.service';
import {Dropbox as DropboxConstant} from '@utils/dropbox';
import {Observable, catchError, from, map, of, switchMap} from 'rxjs';
import {Reactive} from '../utils/reactive';
import {ConfigurationService} from './configuration.service';

@Injectable({providedIn: 'root'})
export class DropboxService {
  files = new Reactive<files.ListFolderResult | undefined>();

  constructor(
    private serviceUtils: UtilsService,
    private configurationService: ConfigurationService,
  ) {
    this.listFiles().subscribe(f => this.files.set(f));
  }

  getDbx(): Dropbox {
    return new Dropbox({
      accessToken: this.configurationService.get().token,
    });
  }

  static getPath(fileName: string): string {
    return DropboxConstant.DROPBOX_FOLDER + fileName;
  }

  private listFiles(): Observable<files.ListFolderResult | undefined> {
    return from(
      this.getDbx().filesListFolder({
        path: DropboxConstant.DROPBOX_FOLDER,
      }),
    ).pipe(
      map(response => response.result),
      catchError((err: unknown) => {
        if (
          (err instanceof DropboxResponseError &&
            [0, 504].includes(err.status)) ||
          err instanceof TypeError
        ) {
          // No internet connection
          return of(undefined);
        } else {
          return this.serviceUtils.handleError(err, 'Error when listing files');
        }
      }),
    );
  }

  downloadFile(fileName: string): Observable<string> {
    return from(
      this.getDbx().filesDownload({
        path: DropboxService.getPath(fileName),
      }),
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
          `Error when downloading file ${fileName}`,
        ),
      ),
    );
  }
}
