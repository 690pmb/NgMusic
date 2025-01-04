import {SortDirection} from '@angular/material/sort';

export class Fichier {
  category: string;
  creation: string;
  name: string;
  type: string;
  rangeBegin: number;
  rangeEnd: number;
  rank: number;
  size: number;
  author?: string;
  publish?: number;
  sorted: number; // 0: false, 1: true
  compoList: CompositionLight[] = [];
  displayedCompoList: CompositionLight[];

  constructor(
    category: string,
    creation: string,
    name: string,
    rangeBegin: string,
    rangeEnd: string,
    rank: string,
    size: string,
    sorted: string,
    type: string,
  ) {
    this.category = category;
    this.creation = creation;
    this.name = name;
    this.rangeBegin = +rangeBegin;
    this.rangeEnd = +rangeEnd;
    this.rank = +rank;
    this.size = +size;
    this.sorted = sorted === 'true' ? 1 : 0;
    this.type = type;
    this.displayedCompoList = [];
  }
}

export class Composition {
  id?: number;
  artist: string;
  title: string;
  sArtist: string;
  sTitle: string;
  score: number;
  size: number;
  decile: number;
  type: string;
  deleted: number; // 0: false, 1: true
  rank: number;
  fileList: FichierLight[] = [];
  displayedFileList: FichierLight[];

  constructor(
    id: number,
    artist: string,
    title: string,
    type: string,
    deleted: string,
    sArtist: string,
    sTitle: string,
    score: string,
    size: string,
    decile: string,
    rank: string,
  ) {
    this.id = id;
    this.artist = artist;
    this.title = title;
    this.type = type;
    this.sArtist = sArtist;
    this.sTitle = sTitle;
    this.score = +score / 10;
    this.size = +size;
    this.decile = +decile;
    this.deleted = deleted === 'true' ? 1 : 0;
    this.rank = +rank;
    this.displayedFileList = [];
  }
}

export type All = Composition | CompositionLight | Fichier | FichierLight;

export type FichierLight = Omit<Fichier, 'compoList' | 'displayedCompoList'>;
export type CompositionLight = Omit<
  Composition,
  'displayedFileList' | 'fileList'
>;

export type Dropdown = Record<'code' | 'label', string>;

export type File = Partial<Record<'filename' | 'id', string>>;

export const isComposition = (c: All): c is Composition => 'artist' in c;

export const isFichier = (f: All): f is Fichier => 'name' in f;

export type Field<T> = `${string & keyof T}`;

export type Sort<T> = {active: Field<T>; direction: SortDirection};
