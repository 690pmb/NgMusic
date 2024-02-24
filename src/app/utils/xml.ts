export type XComposition = {
  id: number;
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

export type XWrapper<T extends XComposition | XFichier> = (T extends XFichier
  ? XCompositions
  : XFichiers) & {
  $: T;
};

export type XF = {
  Fichiers: XFichiers;
};

export type XC = {
  Compositions: XCompositions;
};

export const isXF = (data: unknown): data is XF =>
  typeof data === 'object' && data !== null && 'Fichiers' in data;

export const isXC = (data: unknown): data is XC =>
  typeof data === 'object' && data !== null && 'Compositions' in data;
