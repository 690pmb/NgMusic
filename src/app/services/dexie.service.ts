import { Injectable } from '@angular/core';
import Dexie from 'dexie';

@Injectable({
  providedIn: 'root'
})
export class DexieService extends Dexie {

  constructor() {
    super('NgMusic');
    this.version(1).stores({
      composition: '++id, artist, title, sArtist, sTitle, type, score, size, deleted, *fichier'
    });
  }

}
