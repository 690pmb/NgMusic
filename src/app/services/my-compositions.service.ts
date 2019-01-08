import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as xml2js from 'xml2js';
import Dexie from 'dexie';

import { DropboxService } from './dropbox.service';
import { UtilsService } from './utils.service';
import { Composition, Fichier } from '../utils/model';
import { DexieService } from '../services/dexie.service';

@Injectable({
  providedIn: 'root'
})
export class MyCompositionsService {
  parser = new xml2js.Parser();
  table: Dexie.Table<Composition, number>;
  done$ = new BehaviorSubject(false);

  constructor(
    private dropboxService: DropboxService,
    private serviceUtils: UtilsService,
    private dexieService: DexieService
  ) {
    this.table = this.dexieService.table('composition');
  }

  downloadCompostion(fileName: string): void {
    const t0 = performance.now();
    // download file
    this.getAll().then(all => {
      if (all === undefined || all === null || all.length === 0) {
        this.dropboxService.downloadFile(fileName)
          .then((compoFromFile: string) => {
            if (compoFromFile && compoFromFile.trim().length > 0) {
              const compoList = [];
              // Parse file
              this.parser.parseString(compoFromFile, (err, result) => {
                result.ListCompositions.compo.forEach(el => {
                  compoList.push(this.parseCompostion(el));
                });
                const t1 = performance.now();
                console.log('Call to doSomething took ' + (t1 - t0) + ' milliseconds');
              });
              return compoList;
            } else {
              return [];
            }
          })
          .then((compoList: Composition[]) => {
            this.addAll(compoList);
            this.done$.next(true);
          }).catch(err => this.serviceUtils.handlePromiseError(err));
      } else {
        this.done$.next(true);
      }
    });
  }

  getAll(): Promise<Composition[]> {
    return this.table.toArray();
  }

  add(data: Composition) {
    return this.table.add(data);
  }

  addAll(data: Composition[]) {
    this.table.bulkAdd(data).then((lastKey) => {
      console.log(`Done adding ${data.length} compositions`);
      console.log('Last composition id was: ' + lastKey);
    }).catch(Dexie.BulkError, (e) => {
      // Explicitely catching the bulkAdd() operation makes those successful
      // additions commit despite that there were errors.
      console.error(`Some composition did not succeed. However, ${data.length - e.failures.length} compositions was added successfully`);
    });
  }

  update(id, data) {
    return this.table.update(id, data);
  }

  remove(id) {
    return this.table.delete(id);
  }

  parseCompostion(compoXml: any): Composition {
    const c = new Composition(compoXml.$.A, compoXml.$.T, compoXml.$.type, compoXml.$.del);
    // c.fileList = this.parseFichierList(compoXml.file);
    return c;
  }

  parseFichierList(fichierXml: any[]): Fichier[] {
    const fileList = [];
    fichierXml.forEach((elFile: any) => {
      const fichier = new Fichier(elFile.$.author, elFile.$.cat, elFile.$.creation, elFile.$.name,
        elFile.$.publish, elFile.$.rangeB, elFile.$.rangeE, elFile.$.rank, elFile.$.size, elFile.$.sorted);
      fileList.push(fichier);
    });
    return fileList;
  }


}
