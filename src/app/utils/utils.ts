import {PageEvent} from '@angular/material/paginator';
import {SortDirection} from '@angular/material/sort';
import {Composition, Fichier, isComposition} from './model';

export class Utils {
  static sort<T extends Composition | Fichier, K extends string & keyof T>(
    list: T[],
    active?: K,
    direction?: SortDirection
  ): T[] {
    if (list.length > 0 && active && direction !== undefined) {
      const isAsc: boolean = direction === 'asc';
      return list.sort((a, b) => {
        if (isComposition(a) && isComposition(b) && active === 'score') {
          return (
            (a.decile < b.decile
              ? -1
              : a.decile > b.decile
                ? 1
                : a.score < b.score
                  ? -1
                  : 1) * (isAsc ? 1 : -1)
          );
        } else {
          return Utils.sortFields<T, K>(a, active, b, isAsc);
        }
      });
    } else {
      return list;
    }
  }

  private static sortFields<
    T extends Composition | Fichier,
    K extends string & keyof T,
  >(a: T, active: K, b: T, isAsc: boolean): number {
    let A;
    let B;
    if (typeof a[active] === 'string') {
      A = (a[active] as string).trim().toLowerCase();
      B = (b[active] as string).trim().toLowerCase();
    } else if (Array.isArray(a[active])) {
      A = (a[active] as []).length;
      B = (b[active] as []).length;
    }
    return ((A ?? a[active]) < (B ?? b[active]) ? -1 : 1) * (isAsc ? 1 : -1);
  }

  static filterByFields<T>(
    items: T[],
    field: string & keyof T,
    value: string
  ): T[] {
    if (!items || items === undefined) {
      return [] as T[];
    }
    if (
      value === undefined ||
      value.trim().length === 0 ||
      value.trim() === ''
    ) {
      return items;
    }
    const term = Utils.cleanString(value);
    return items.filter(item => {
      const fieldItem = item[field];
      return (
        typeof fieldItem === 'string'
          ? Utils.cleanString(fieldItem)
          : fieldItem?.toString()
      )?.includes(term);
    });
  }

  static cleanString(s: string): string {
    return s
      .replaceAll(/^(T|t)?he /g, '')
      .replaceAll(/\(.*\)|\[.*\]/g, '')
      .replaceAll(/\W/g, '')
      .toLowerCase();
  }

  static paginate<T>(list: T[], page: PageEvent): T[] {
    return list.slice(
      page.pageIndex * page.pageSize,
      (page.pageIndex + 1) * page.pageSize
    );
  }
}
