import {OnInit, Directive} from '@angular/core';
import {Sort} from '@angular/material/sort';
import {PageEvent} from '@angular/material/paginator';
import {Dropdown} from '../utils/model';
import {Utils} from '../utils/utils';

@Directive()
export abstract class ListDirective<T> implements OnInit {
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

  constructor() {}

  ngOnInit(): void {
    this.page = this.initPagination();
    this.types = [
      new Dropdown('Chanson', 'SONG'),
      new Dropdown('Album', 'ALBUM'),
    ];
    this.catList = [
      new Dropdown('Year', 'YEAR'),
      new Dropdown('Decade', 'DECADE'),
      new Dropdown('Long Period', 'LONG_PERIOD'),
      new Dropdown('All Time', 'ALL_TIME'),
      new Dropdown('Theme', 'THEME'),
      new Dropdown('Genre', 'GENRE'),
      new Dropdown('Divers', 'MISCELLANEOUS'),
    ];
  }

  abstract filter(list: T[]): T[];

  abstract sortList(list: T[]): T[];

  initPagination(): PageEvent {
    const page = new PageEvent();
    page.pageIndex = 0;
    page.pageSize = 50;
    return page;
  }

  onSort(): void {
    this.page = this.initPagination();
    this.dataList = this.sortList(this.dataList);
    this.displayedData = Utils.paginate(this.filter(this.dataList), this.page);
  }

  onSearch(): void {
    this.initPagination();
    this.dataList = this.sortList(this.dataList);
    this.displayedData = Utils.paginate(this.filter(this.dataList), this.page);
  }

  onPaginateChange(): void {
    this.displayedData = Utils.paginate(this.filter(this.dataList), this.page);
  }
}
