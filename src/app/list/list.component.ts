import { Component, OnInit, ElementRef } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';

import { Composition } from '../utils/model';
import { Utils } from '../utils/utils';

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

  constructor(
    private elemRef: ElementRef,
  ) { }

  ngOnInit() {
    this.compoList = JSON.parse(sessionStorage.getItem('compoList'));
    this.length = this.compoList.length;
    this.initPagination(this.refreshData());
  }

  refreshData(): Composition[] {
    const list = Utils.sortComposition(this.compoList, this.sort);
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
