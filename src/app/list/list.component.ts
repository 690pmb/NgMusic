import {OnInit, Directive} from '@angular/core';
import {PageEvent} from '@angular/material/paginator';
import {Dropdown, Sort, Field, Composition} from '@utils/model';
import {Utils} from '@utils/utils';
import {UtilsService} from '@services/utils.service';

@Directive()
export abstract class ListDirective<T> implements OnInit {
  dataList: T[] = [];
  length?: number;
  displayedData: T[] = [];
  pageSizeOptions = [25, 50, 100, 200];
  page!: PageEvent;
  sort?: Sort<T>;
  compositionColumns!: (Field<Composition> | 'menu')[];
  displayedColumnsComposition!: (Field<Composition> | 'menu')[];
  isDesktop = false;
  expandedElement?: T;

  readonly types = [
    new Dropdown('Chanson', 'SONG'),
    new Dropdown('Album', 'ALBUM'),
  ];

  readonly catList = [
    new Dropdown('Year', 'YEAR'),
    new Dropdown('Decade', 'DECADE'),
    new Dropdown('Long Period', 'LONG PERIOD'),
    new Dropdown('All Time', 'ALL TIME'),
    new Dropdown('Theme', 'THEME'),
    new Dropdown('Genre', 'GENRE'),
    new Dropdown('Divers', 'MISCELLANEOUS'),
  ];

  constructor(protected utilsService: UtilsService) {}

  ngOnInit(): void {
    this.page = this.initPagination();
    this.utilsService.isDesktop().subscribe(isDesktop => {
      this.isDesktop = isDesktop;
      if (isDesktop) {
        this.displayedColumnsComposition = [...this.compositionColumns, 'menu'];
      } else {
        this.displayedColumnsComposition = [...this.compositionColumns];
      }
    });
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
    this.expandedElement = undefined;
    this.displayedData = Utils.paginate(this.filter(this.dataList), this.page);
  }

  onSearch(): void {
    this.initPagination();
    this.expandedElement = undefined;
    this.displayedData = Utils.paginate(this.filter(this.dataList), this.page);
  }

  onPaginateChange(): void {
    this.expandedElement = undefined;
    this.displayedData = Utils.paginate(this.filter(this.dataList), this.page);
  }
}
