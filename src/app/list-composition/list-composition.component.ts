import { Component, OnInit, ElementRef } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { faTimesCircle } from '@fortawesome/free-regular-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { skipWhile } from 'rxjs/operators';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { BehaviorSubject } from 'rxjs';
import { faAngleUp } from '@fortawesome/free-solid-svg-icons';

import { Composition, Dropdown } from '../utils/model';
import { Utils } from '../utils/utils';
import { DataService } from '../services/data.service';
import { UtilsService } from '../services/utils.service';

library.add(faTimesCircle);

@Component({
  selector: 'app-list-composition',
  templateUrl: './list-composition.component.html',
  styleUrls: ['./list-composition.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', display: 'none' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class ListCompositionComponent implements OnInit {
  compoList: Composition[];
  displayedColumns = ['artist', 'title', 'type', 'sizeC', 'score'];
  displayedColumnsFichier = ['name', 'category', 'rangeBegin', 'rangeEnd', 'size', 'rank'];
  length: number;
  displayedData: Composition[];
  displayedFichier = new BehaviorSubject([]);
  pageSizeOptions = [25, 50, 100, 200];
  page: PageEvent;
  sort: Sort;
  expandedElement: Composition;
  expandedColumn = 'details';
  // Filters
  artistFilter = '';
  titleFilter = '';
  filenameFilter = '';
  filteredType: Dropdown;
  types: Dropdown[];
  filteredCat: Dropdown[];
  catList: Dropdown[];
  deleted = false;
  beginFilter: number;
  endFilter: number;
  faAngleUp = faAngleUp;

  constructor(
    private elemRef: ElementRef,
    private myCompositionsService: DataService,
    private serviceUtils: UtilsService
  ) { }

  ngOnInit(): void {
    this.sort = { active: 'score', direction: 'desc' };
    this.types = [new Dropdown('Chanson', 'SONG'), new Dropdown('Album', 'ALBUM')];
    this.catList = [new Dropdown('Year', 'YEAR'), new Dropdown('Decade', 'DECADE'),
    new Dropdown('Long Period', 'LONG_PERIOD'), new Dropdown('All Time', 'ALL_TIME'),
    new Dropdown('Theme', 'THEME'), new Dropdown('Genre', 'GENRE'), new Dropdown('Divers', 'MISCELLANEOUS')];
    this.initPagination();
    this.myCompositionsService.done$.pipe(skipWhile(done => done !== undefined && !done)).subscribe(() =>
      this.myCompositionsService.getAll(this.myCompositionsService.compositionTable).then(list => {
        this.compoList = this.sortList(list);
        this.length = list.length;
        this.paginate(this.filter(this.compoList));
      }).catch(err => this.serviceUtils.handlePromiseError(err))
    );
  }

  filter(list: Composition[]): Composition[] {
    // Composition filters
    let result = this.filterOnComposition(list);
    // Fichier filters
    result = this.filterOnFichier(result);
    this.length = result.length;
    return result;
  }

  filterOnComposition(list: Composition[]): Composition[] {
    let result = list;
    if (this.artistFilter) {
      result = Utils.filterByFields(result, ['artist'], this.artistFilter);
    }
    if (this.titleFilter) {
      result = Utils.filterByFields(result, ['title'], this.titleFilter);
    }
    if (this.filteredType) {
      result = Utils.filterByFields(result, ['type'], this.filteredType.code);
    }
    if (!this.deleted) {
      result = result.filter(c => !c.deleted);
    }
    return result;
  }

  filterOnFichier(list: Composition[]): Composition[] {
    let result = list;
    if (this.filteredCat && this.filteredCat.length > 0) {
      result = result.filter(c => c.fileList.some(f => this.filteredCat.map(filter => filter.code).includes(f.category)));
    }
    if (this.filenameFilter) {
      result = result.filter(c => c.fileList.some(f => f.name.toLowerCase().includes(this.filenameFilter.toLowerCase())));
    }
    if (this.beginFilter) {
      result = result.filter(c => c.fileList.some(f => f.rangeBegin >= this.beginFilter));
    }
    if (this.endFilter) {
      result = result.filter(c => c.fileList.some(f => f.rangeEnd <= this.endFilter));
    }
    return result;
  }

  sortList(list: Composition[]): Composition[] {
    return Utils.sortComposition(list, this.sort);
  }

  paginate(list: Composition[]): void {
    this.displayedData = list.slice(this.page.pageIndex * this.page.pageSize, (this.page.pageIndex + 1) * this.page.pageSize);
  }

  expand(element: Composition): void {
    this.expandedElement = this.expandedElement === element ? undefined : element;
    if (this.expandedElement) {
      this.displayedFichier.next(Utils.sortFichier(this.expandedElement.fileList, { active: 'rank', direction: 'asc' }));
    }
  }

  onSortFichier(sort: Sort): void {
    this.displayedFichier.next(Utils.sortFichier(this.expandedElement.fileList, sort));
  }

  initPagination(): void {
    this.page = new PageEvent();
    this.page.pageIndex = 0;
    this.page.pageSize = 50;
  }

  onSort(): void {
    this.initPagination();
    this.compoList = this.sortList(this.compoList);
    this.paginate(this.filter(this.compoList));
  }

  onSearch(): void {
    this.initPagination();
    this.compoList = this.sortList(this.compoList);
    this.paginate(this.filter(this.compoList));
  }

  onPaginateChange(): void {
    this.paginate(this.filter(this.compoList));
  }

  goTop(): void {
    this.elemRef.nativeElement.querySelector('.filters').scrollIntoView();
  }

}
