import {Injectable} from '@angular/core';
import DropboxTypes from 'dropbox';
import {UtilsService} from './utils.service';
import {Dropbox as DropboxConstant} from '../utils/dropbox';

@Injectable({providedIn: 'root'})
export class DropboxService {
  constructor(private serviceUtils: UtilsService) {}

  getDbx(): DropboxTypes.Dropbox {
    return new DropboxTypes.Dropbox({
      accessToken: DropboxConstant.DROPBOX_TOKEN,
    });
  }

  listFiles(folder: string): Promise<DropboxTypes.files.ListFolderResult> {
    return this.getDbx()
      .filesListFolder({path: folder})
      .then((response: DropboxTypes.files.ListFolderResult) => response)
      .catch(err => {
        this.serviceUtils.handleError(err);
        return undefined;
      });
  }

  getPath(fileName: string): string {
    return DropboxConstant.DROPBOX_FOLDER + fileName;
  }

  downloadFile(fileName: string): Promise<unknown> {
    return (
      this.getDbx()
        .filesDownload({path: this.getPath(fileName)})
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((response: any) => {
          const fileReader = new FileReader();
          return new Promise((resolve, reject) => {
            fileReader.onerror = () => {
              fileReader.abort();
              reject(new DOMException('Problem parsing input file.'));
            };
            fileReader.onload = () => resolve(fileReader.result.toString());
            fileReader.readAsBinaryString(response.fileBlob);
          });
        })
        .catch(err => this.serviceUtils.handleError(err))
    );
  }
}
