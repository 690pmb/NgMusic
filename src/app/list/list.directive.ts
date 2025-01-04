import {OnInit, Directive} from '@angular/core';
import {Dropdown, Sort, Field, Composition} from '@utils/model';
import {Utils} from '@utils/utils';
import {UtilsService} from '@services/utils.service';
import {PaginatorService} from '@services/paginator.service';

@Directive({standalone: true})
export abstract class ListDirective<T> implements OnInit {
  dataList: T[] = [];
  displayedData: T[] = [];
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

  constructor(
    protected utilsService: UtilsService,
    protected paginatorService: PaginatorService,
  ) {}

  ngOnInit(): void {
    this.utilsService.isDesktop().subscribe(isDesktop => {
      this.isDesktop = isDesktop;
      if (isDesktop) {
        this.displayedColumnsComposition = [...this.compositionColumns, 'menu'];
      } else {
        this.displayedColumnsComposition = [...this.compositionColumns];
      }
    });
  }

  abstract filter(list: T[], firstPage: boolean): T[];

  abstract sortList(list: T[]): T[];

  onSort(): void {
    this.updateList(true);
  }

  onSearch(): void {
    this.updateList(true);
  }

  onPaginateChange(): void {
    this.updateList(false);
  }

  private updateList(firstPage: boolean): void {
    this.expandedElement = undefined;
    this.paginatorService.page.subscribe(
      p =>
        (this.displayedData = Utils.paginate(
          this.sortList(this.filter(this.dataList, firstPage)),
          p,
        )),
    );
  }
}
