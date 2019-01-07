import { Component, OnInit, ElementRef } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { faTimesCircle } from '@fortawesome/free-regular-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';

import { Composition } from '../utils/model';
import { Utils } from '../utils/utils';
import { MyCompositionsService } from '../services/my-compositions.service';

library.add(faTimesCircle);

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  compoList: Composition[];
  displayedColumns = ['artist', 'title', 'type'];
  length: number;
  displayedData: Composition[];
  pageSize = 25;
  pageIndex = 0;
  pageSizeOptions = [10, 25, 50, 100];
  page: PageEvent;
  sort: Sort;
  artistFilter: string;
  titleFilter: string;

  constructor(
    private elemRef: ElementRef,
    private myCompositionsService: MyCompositionsService
  ) { }

  ngOnInit() {
    this.sort = { active: 'artist', direction: 'asc' };
    this.myCompositionsService.myCompositions$.subscribe(compoList => {
      this.compoList = compoList;
      this.length = this.compoList.length;
      this.initPagination(this.refreshData());
    });
  }

  refreshData(): Composition[] {
    let list = this.compoList;
    if (this.artistFilter) {
      list = Utils.filterByFields(list, ['artist'], this.artistFilter);
    }
    if (this.titleFilter) {
      list = Utils.filterByFields(list, ['title'], this.titleFilter);
    }
    list = Utils.sortComposition(list, this.sort);
    this.length = list.length;
    return list;
  }

  initPagination(list: Composition[]): void {
    if (this.page) {
      this.page.pageIndex = 0;
      this.page.pageSize = this.page ? this.page.pageSize : this.pageSize;
    }
    this.paginate(list);
  }

  onSort(): void {
    this.initPagination(this.refreshData());
    this.onTop();
  }

  onSearch(): void {
    this.initPagination(this.refreshData());
    this.onTop();
  }

  onPaginateChange(): void {
    this.paginate(this.refreshData());
    this.onTop();
  }

  paginate(data: Composition[]): void {
    this.displayedData = this.page ?
      data.slice(this.page.pageIndex * this.page.pageSize, (this.page.pageIndex + 1) * this.page.pageSize) : data.slice(0, this.pageSize);
  }

  onTop(): void {
    // this.elemRef.nativeElement.querySelector('.filters').scrollIntoView();
  }

}
