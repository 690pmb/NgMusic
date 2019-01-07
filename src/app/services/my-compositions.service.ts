import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as xml2js from 'xml2js';

import { DropboxService } from './dropbox.service';
import { UtilsService } from './utils.service';
import { Composition, Fichier } from '../utils/model';

@Injectable({
  providedIn: 'root'
})
export class MyCompositionsService {
  myCompositions$ = new BehaviorSubject([]);
  parser = new xml2js.Parser();

  constructor(
    private dropboxService: DropboxService,
    private serviceUtils: UtilsService,
  ) { }

  getAll(fileName: string): void {
    console.log('getAll');
    const t0 = performance.now();
    this.dropboxService.downloadFile(fileName)
      .then((compoFromFile: string) => {
        if (compoFromFile && compoFromFile.trim().length > 0) {
          const compoList = [];
          this.parser.parseString(compoFromFile, (err, result) => {
            result.ListCompositions.compo.forEach(el => {
              const c = new Composition(el.$.A, el.$.T, el.$.type, el.$.del, el.$.mergeable);
              const fileList = [];
              el.file.forEach((elFile: any) => {
                const fichier = new Fichier(elFile.$.author, elFile.$.cat, elFile.$.creation, elFile.$.name,
                  elFile.$.publish, elFile.$.rangeB, elFile.$.rangeE, elFile.$.rank, elFile.$.size, elFile.$.sorted);
                fileList.push(fichier);
              });
              c.fileList = fileList;
              compoList.push(c);
            });
            sessionStorage.setItem('compoList', JSON.stringify(compoList));
            const t1 = performance.now();
            console.log('Call to doSomething took ' + (t1 - t0) + ' milliseconds');
          });
          return compoList;
        } else {
          return [];
        }
      })
      .then((compoList: Composition[]) => {
        this.myCompositions$.next(compoList);
      }).catch(err => this.serviceUtils.handlePromiseError(err));
  }
}
