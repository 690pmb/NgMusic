import { Component, OnInit } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';

export abstract class ListComponent<T> implements OnInit {
  dataList: T[];
  length: number;
  displayedData: T[];
  pageSizeOptions = [25, 50, 100, 200];
  page: PageEvent;
  sort: Sort;

  constructor() { }

  ngOnInit(): void {
    this.initPagination();
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
