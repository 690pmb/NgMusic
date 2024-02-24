import {Injectable} from '@angular/core';
import Dexie from 'dexie';
import {Composition, Fichier, File} from '@utils/model';
import {Table} from '../utils/table';

@Injectable({
  providedIn: 'root',
})
export class DexieService extends Dexie {
  compositionTable: Table<Composition>;
  fichierTable: Table<Fichier>;
  fileComposition: Table<File>;
  fileFichier: Table<File>;

  constructor() {
    super('NgMusic');
    this.version(1).stores({
      composition:
        '++id, artist, title, sArtist, sTitle, type, score, size, deleted, *fichier',
      fichier:
        '++id, name, category, rangeBegin, rangeEnd, sorted, rank, creation, size, *composition',
      fileComposition: '++id, &filename',
      fileFichier: '++id, &filename',
    });
    this.fileComposition = new Table(this.table('fileComposition'));
    this.fileFichier = new Table(this.table('fileFichier'));
    this.compositionTable = new Table(this.table('composition'));
    this.fichierTable = new Table(this.table('fichier'));
  }
}
