import {Injectable} from '@angular/core';
import Dexie from 'dexie';
import {Composition, Fichier} from '../utils/model';

@Injectable({
  providedIn: 'root',
})
export class DexieService extends Dexie {
  compositionTable: Dexie.Table<Composition, number>;
  fichierTable: Dexie.Table<Fichier, number>;
  fileComposition: Dexie.Table<any, number>;
  fileFichier: Dexie.Table<any, number>;

  constructor() {
    super('NgMusic');
    this.version(1).stores({
      composition:
        '++id, artist, title, sArtist, sTitle, type, score, size, deleted, *fichier',
      fichier:
        '++id, name, category, rangeBegin, rangeEnd, sorted, rank, creation, size, *composition',
      fileComposition: '++id, filename',
      fileFichier: '++id, filename',
    });
    this.fileComposition = this.table('fileComposition');
    this.fileFichier = this.table('fileFichier');
    this.compositionTable = this.table('composition');
    this.fichierTable = this.table('fichier');
  }
}
