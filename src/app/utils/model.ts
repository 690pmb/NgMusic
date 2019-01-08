export class Fichier {
  author: string;
  category: string;
  creation: string;
  name: string;
  publish: string;
  rangeBegin: string;
  rangeEnd: string;
  rank: string;
  size: string;
  sorted: string;

  constructor(author: string, category: string, creation: string, name: string, publish: string, rangeBegin: string, rangeEnd: string,
    rank: string, size: string, sorted: string) {
    this.author = author;
    this.category = category;
    this.creation = creation;
    this.name = name;
    this.publish = publish;
    this.rangeBegin = rangeBegin;
    this.rangeEnd = rangeEnd;
    this.rank = rank;
    this.size = size;
    this.sorted = sorted;
  }
}

export class Composition {
  id: number;
  artist: string;
  title: string;
  sArtist: string;
  sTitle: string;
  score: number;
  size: number;
  type: string;
  deleted: boolean;
  fileList: Fichier[];

  constructor(artist: string, title: string, type: string, deleted: string,
    sArtist: string, sTitle: string, score: string, size: string) {
    this.artist = artist;
    this.title = title;
    this.type = type;
    this.sArtist = sArtist;
    this.sTitle = sTitle;
    this.score = +score;
    this.size = +size;
    this.deleted = JSON.parse(deleted);
  }
}
