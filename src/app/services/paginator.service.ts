import {Injectable} from '@angular/core';
import {PageEvent} from '@angular/material/paginator';
import {Reactive} from '../utils/reactive';
import {take, Observable, map} from 'rxjs';
import {Field} from '@utils/model';

@Injectable({
  providedIn: 'root',
})
export class PaginatorService {
  page$ = new Reactive<PageEvent>();

  constructor() {
    this.page$.set(PaginatorService.initPagination());
  }

  public static initPagination(): PageEvent {
    const p = new PageEvent();
    p.pageIndex = 0;
    p.length = 0;
    p.pageSize = 50;
    return p;
  }

  public updatePage(update: Partial<PageEvent>): void {
    this.page
      .pipe(
        map(p => {
          if (update.pageSize !== p.pageSize) {
            update.pageIndex = 0;
          }
          (Object.keys(update) as Field<PageEvent>[]).forEach(k => {
            if (update[k] !== undefined) {
              p[k] = update[k]!;
            }
          });
          return p;
        })
      )
      .subscribe(p => this.page$.set(p));
  }

  get page(): Observable<PageEvent> {
    return this.page$.obs$.pipe(take(1));
  }
}
