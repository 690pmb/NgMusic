import {PageEvent} from '@angular/material/paginator';
import {Reactive} from '../utils/reactive';
import {take, Observable, map} from 'rxjs';

export class PaginatorService {
  id!: string;
  page$ = new Reactive<PageEvent>();

  constructor(id: string) {
    this.id = id;
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
        map(
          p =>
            ({
              length: update.length ?? 0,
              pageIndex: update.pageIndex ?? p.pageIndex,
              pageSize: update.pageSize ?? p.pageSize,
              previousPageIndex: p.previousPageIndex,
            }) satisfies PageEvent
        )
      )
      .subscribe(p => this.page$.set(p));
  }

  get page(): Observable<PageEvent> {
    return this.page$.obs$.pipe(take(1));
  }
}
