import { Component, OnInit } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import { Dropdown } from '../utils/model';

export abstract class ListComponent<T> implements OnInit {
  dataList: T[];
  length: number;
  displayedData: T[];
  pageSizeOptions = [25, 50, 100, 200];
  page: PageEvent;
  sort: Sort;
  // Filters
  types: Dropdown[];
  filteredType: Dropdown;
  filteredCat: Dropdown[];
  catList: Dropdown[];
  beginFilter: number;
  endFilter: number;

  constructor() { }

  ngOnInit(): void {
    this.initPagination();
    this.types = [new Dropdown('Chanson', 'SONG'), new Dropdown('Album', 'ALBUM')];
    this.catList = [new Dropdown('Year', 'YEAR'), new Dropdown('Decade', 'DECADE'),
    new Dropdown('Long Period', 'LONG_PERIOD'), new Dropdown('All Time', 'ALL_TIME'),
    new Dropdown('Theme', 'THEME'), new Dropdown('Genre', 'GENRE'), new Dropdown('Divers', 'MISCELLANEOUS')];
  }

  abstract filter(list: T[]): T[];

  abstract sortList(list: T[]): T[];

  paginate(list: T[]): void {
    this.displayedData = list.slice(this.page.pageIndex * this.page.pageSize, (this.page.pageIndex + 1) * this.page.pageSize);
  }

  initPagination(): void {
    this.page = new PageEvent();
    this.page.pageIndex = 0;
    this.page.pageSize = 50;
  }

  onSort(): void {
    this.initPagination();
    this.dataList = this.sortList(this.dataList);
    this.paginate(this.filter(this.dataList));
  }

  onSearch(): void {
    this.initPagination();
    this.dataList = this.sortList(this.dataList);
    this.paginate(this.filter(this.dataList));
  }

  onPaginateChange(): void {
    this.paginate(this.filter(this.dataList));
  }
}
