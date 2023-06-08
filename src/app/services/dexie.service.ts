import {Injectable} from '@angular/core';
import Dexie from 'dexie';
import {Composition, Fichier, File} from '../utils/model';

@Injectable({
  providedIn: 'root',
})
export class DexieService extends Dexie {
  compositionTable: Dexie.Table<Composition, number>;
  fichierTable: Dexie.Table<Fichier, number>;
  fileComposition: Dexie.Table<File, number>;
  fileFichier: Dexie.Table<File, number>;

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

  static getAll<T>(table: Dexie.Table<T, number>): Promise<T[]> {
    return table.toArray();
  }

  static add<T>(table: Dexie.Table<T, number>, data: T): Promise<number> {
    return table.add(data);
  }

  static addAll<T>(table: Dexie.Table<T, number>, data: T[]): Promise<void> {
    return table
      .bulkAdd(data)
      .then(() => console.warn(`Done adding ${data.length} datas`))
      .catch(Dexie.BulkError, e => {
        // Explicitely catching the bulkAdd() operation makes those successful
        // additions commit despite that there were errors.
        console.error(
          `Some items did not succeed. However, ${
            data.length - e.failures.length
          } items was added successfully`
        );
      });
  }

  static update<T>(
    table: Dexie.Table<T, number>,
    id: number,
    data: T
  ): Promise<number> {
    return table.update(id, data);
  }

  static remove<T>(table: Dexie.Table<T, number>, id: number): Promise<void> {
    return table.delete(id);
  }
}
