import { Component, OnInit, ElementRef } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { faTimesCircle } from '@fortawesome/free-regular-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { skipWhile } from 'rxjs/operators';
import { animate, state, style, transition, trigger } from '@angular/animations';

import { Composition } from '../utils/model';
import { Utils } from '../utils/utils';
import { CompositionService } from '../services/composition.service';
import { UtilsService } from '../services/utils.service';

library.add(faTimesCircle);

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', display: 'none' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class ListComponent implements OnInit {
  compoList: Composition[];
  displayedColumns = ['artist', 'title', 'type', 'size', 'score'];
  length: number;
  displayedData: Composition[];
  pageSizeOptions = [10, 25, 50, 100];
  page: PageEvent;
  sort: Sort;
  artistFilter = '';
  titleFilter = '';
  deleted = false;
  expandedElement: Composition;
  expandedColumn = 'details';

  constructor(
    private elemRef: ElementRef,
    private myCompositionsService: CompositionService,
    private serviceUtils: UtilsService
  ) { }

  ngOnInit(): void {
    this.sort = { active: 'score', direction: 'desc' };
    this.initPagination();
    this.myCompositionsService.done$.pipe(skipWhile(done => done !== undefined && !done)).subscribe(() =>
      this.myCompositionsService.getAll().then(list => {
        this.compoList = this.sortList(list);
        this.length = list.length;
        this.paginate(this.filter(this.compoList));
      }).catch(err => this.serviceUtils.handlePromiseError(err))
    );
  }

  filter(list: Composition[]): Composition[] {
    let result = list;
    if (this.artistFilter) {
      result = Utils.filterByFields(result, ['artist'], this.artistFilter);
    }
    if (this.titleFilter) {
      result = Utils.filterByFields(result, ['title'], this.titleFilter);
    }
    if (!this.deleted) {
      result = result.filter(c => !c.deleted);
    }
    this.length = result.length;
    return result;
  }

  sortList(list: Composition[]): Composition[] {
    return Utils.sortComposition(list, this.sort);
  }

  paginate(list: Composition[]): void {
    this.displayedData = list.slice(this.page.pageIndex * this.page.pageSize, (this.page.pageIndex + 1) * this.page.pageSize);
    this.displayedData.forEach(c => {
      c.fileList = Utils.sortFichier(c.fileList, { active: 'name', direction: 'asc' });
    });
  }

  initPagination(): void {
    this.page = new PageEvent();
    this.page.pageIndex = 0;
    this.page.pageSize = 25;
  }

  onSort(): void {
    this.initPagination();
    this.compoList = this.sortList(this.compoList);
    this.paginate(this.filter(this.compoList));
    this.onTop();
  }

  onSearch(): void {
    this.initPagination();
    this.compoList = this.sortList(this.compoList);
    this.paginate(this.filter(this.compoList));
    this.onTop();
  }

  onPaginateChange(): void {
    this.paginate(this.filter(this.compoList));
    this.onTop();
  }

  onTop(): void {
    this.elemRef.nativeElement.querySelector('.filters').scrollIntoView();
  }

}
