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

  readonly types: Dropdown[] = [
    {label: 'Chanson', code: 'SONG'},
    {label: 'Album', code: 'ALBUM'},
  ];

  readonly catList: Dropdown[] = [
    {label: 'Year', code: 'YEAR'},
    {label: 'Decade', code: 'DECADE'},
    {label: 'Long Period', code: 'LONG PERIOD'},
    {label: 'All Time', code: 'ALL TIME'},
    {label: 'Theme', code: 'THEME'},
    {label: 'Genre', code: 'GENRE'},
    {label: 'Divers', code: 'MISCELLANEOUS'},
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
    this.displayedData = Utils.paginate(
      this.sortList(this.filter(this.dataList)),
      this.page
    );
  }

  onSearch(): void {
    this.initPagination();
    this.expandedElement = undefined;
    this.displayedData = Utils.paginate(
      this.sortList(this.filter(this.dataList)),
      this.page
    );
  }

  onPaginateChange(): void {
    this.expandedElement = undefined;
    this.displayedData = Utils.paginate(
      this.sortList(this.filter(this.dataList)),
      this.page
    );
  }
}
