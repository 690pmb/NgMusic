import { Component, OnInit, ElementRef } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { faTimesCircle } from '@fortawesome/free-regular-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { skipWhile } from 'rxjs/operators';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { BehaviorSubject } from 'rxjs';
import { faAngleUp } from '@fortawesome/free-solid-svg-icons';

import { Composition } from '../utils/model';
import { Utils } from '../utils/utils';
import { DataService } from '../services/data.service';
import { UtilsService } from '../services/utils.service';
import { ListComponent } from '../list/list.component';
import { DexieService } from '../services/dexie.service';

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
export class ListCompositionComponent extends ListComponent<Composition> implements OnInit {
  displayedColumns = ['artist', 'title', 'type', 'sizeC', 'score'];
  displayedColumnsFichier = ['name', 'category', 'rangeBegin', 'rangeEnd', 'size', 'rank'];
  displayedFichier = new BehaviorSubject([]);
  expandedElement: Composition;
  expandedColumn = 'details';
  // Filters
  artistFilter = '';
  titleFilter = '';
  filenameFilter = '';
  deleted = false;
  faAngleUp = faAngleUp;

  constructor(
    private elemRef: ElementRef,
    private myCompositionsService: DataService,
    private dexieService: DexieService,
    private serviceUtils: UtilsService
  ) {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.sort = { active: 'score', direction: 'desc' };
    this.myCompositionsService.doneComposition$.pipe(skipWhile(done => done !== undefined && !done)).subscribe(() =>
      this.myCompositionsService.getAll(this.dexieService.compositionTable).then(list => {
        this.dataList = this.sortList(list);
        this.length = list.length;
        this.paginate(this.filter(this.dataList));
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

  expand(element: Composition): void {
    this.expandedElement = this.expandedElement === element ? undefined : element;
    if (this.expandedElement) {
      this.displayedFichier.next(Utils.sortFichier(this.expandedElement.fileList, { active: 'rank', direction: 'asc' }));
    }
  }

  onSortFichier(sort: Sort): void {
    this.displayedFichier.next(Utils.sortFichier(this.expandedElement.fileList, sort));
  }

  goTop(): void {
    this.elemRef.nativeElement.querySelector('.filters').scrollIntoView();
  }
}
