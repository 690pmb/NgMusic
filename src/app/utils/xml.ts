export type XComposition = {
  A: string;
  T: string;
  type: string;
  del: string;
  sA: string;
  sT: string;
  score: string;
  size: string;
  decile: string;
  rank: string;
};

export type XCompositions = Record<'C', XWrapper<XComposition>[]>;

export type XFichier = {
  name: string;
  cat: string;
  creation: string;
  rangeB: string;
  rangeE: string;
  rank: string;
  size: string;
  sorted: string;
  type: string;
  author: string;
  publish: string;
};

export type XFichiers = Record<'F', XWrapper<XFichier>[]>;

export type XWrapper<T extends XFichier | XComposition> = {
  $: T;
} & (T extends XFichier ? XCompositions : XFichiers);

export type XF = {
  Fichiers: XFichiers;
};

export type XC = {
  Compositions: XCompositions;
};

export const isXF = (data: XF | XC): data is XF => 'Fichiers' in data;

export const isXC = (data: XF | XC): data is XC => 'Compositions' in data;
