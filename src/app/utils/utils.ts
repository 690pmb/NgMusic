import {Sort} from '@angular/material/sort';
import {PageEvent} from '@angular/material/paginator';

import {Composition, Fichier} from './model';

export class Utils {
  static sortComposition(list: Composition[], sort?: Sort): Composition[] {
    if (sort && sort.active && sort.direction !== '') {
      return list.sort((a, b) => {
        const isAsc: boolean = sort.direction === 'asc';
        if (['artist', 'title', 'type'].includes(sort.active)) {
          return Utils.compare(
            a[sort.active].trim().toLowerCase(),
            b[sort.active].trim().toLowerCase(),
            isAsc
          );
        } else if (['score', 'rank'].includes(sort.active)) {
          return Utils.compare(a[sort.active], b[sort.active], isAsc);
        } else if ('size' === sort.active) {
          return Utils.compare(a.size, b.size, isAsc);
        } else if (
          'sizeC' === sort.active &&
          a.displayedFileList &&
          b.displayedFileList
        ) {
          return Utils.compare(
            a.displayedFileList.length,
            b.displayedFileList.length,
            isAsc
          );
        } else {
          return 0;
        }
      });
    } else {
      return list;
    }
  }

  static sortFichier(list: Fichier[], sort?: Sort): Fichier[] {
    if (sort && sort.active && sort.direction !== '') {
      return list.sort((a, b) => {
        const isAsc: boolean = sort.direction === 'asc';
        if (['category', 'name', 'type', 'author'].includes(sort.active)) {
          return Utils.compare(
            a[sort.active].trim().toLowerCase(),
            b[sort.active].trim().toLowerCase(),
            isAsc
          );
        } else if (
          ['rangeBegin', 'rangeEnd', 'rank', 'publish', 'sorted'].includes(
            sort.active
          )
        ) {
          return Utils.compare(a[sort.active], b[sort.active], isAsc);
        } else if (sort.active === 'creation') {
          return Utils.compareDate(a.creation, b.creation, isAsc);
        } else if (['size', 'sizeF'].includes(sort.active)) {
          return Utils.compare(a.size, b.size, isAsc);
        } else {
          return 0;
        }
      });
    } else {
      return list;
    }
  }

  static compare<T>(a: T, b: T, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  static compareDate(a: string, b: string, isAsc: boolean): number {
    const year1: string = a.split('/')[0];
    const month1: string = a.split('/')[1];
    const year2: string = b.split('/')[0];
    const month2: string = b.split('/')[1];
    let result = 1;
    if (year1 < year2) {
      result = -1;
    } else if (year1 > year2) {
      result = 1;
    } else {
      if (month1 < month2) {
        result = -1;
      } else if (month1 > month2) {
        result = 1;
      }
    }
    return result * (isAsc ? 1 : -1);
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
    const term = value.replaceAll(/\s/g, '').toLowerCase();
    return items.filter(item => {
      const fieldItem = item[field];
      return (
        typeof fieldItem === 'string'
          ? fieldItem.toLowerCase()
          : fieldItem?.toString()
      )?.includes(term);
    });
  }

  static paginate<T>(list: T[], page: PageEvent): T[] {
    return list.slice(
      page.pageIndex * page.pageSize,
      (page.pageIndex + 1) * page.pageSize
    );
  }
}
