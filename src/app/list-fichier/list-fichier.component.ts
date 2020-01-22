import { Component, OnInit, ElementRef } from '@angular/core';
import { faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { BehaviorSubject } from 'rxjs';
import { skipWhile } from 'rxjs/operators';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';

import { ListComponent } from '../list/list.component';
import { Fichier, Composition } from '../utils/model';
import { DataService } from '../services/data.service';
import { UtilsService } from '../services/utils.service';
import { DexieService } from '../services/dexie.service';
import { Utils } from '../utils/utils';

@Component({
  selector: 'app-list-fichier',
  templateUrl: './list-fichier.component.html',
  styleUrls: ['./list-fichier.component.scss'],
  animations: [
    trigger('compositionExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', display: 'none' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])
  ]
})
export class ListFichierComponent extends ListComponent<Fichier> implements OnInit {
  displayedColumns = ['author', 'name', 'type', 'category', 'sizeF', 'publish'];
  displayedColumnsComposition = ['artist', 'title', 'rank', 'size', 'score'];
  expandedCompositions = new BehaviorSubject([]);
  displayedCompositions: Composition[];
  pageComposition: PageEvent;
  expandedElement: Fichier;
  expandedColumn = 'compositions';
  faAngleUp = faAngleUp;
  // Filters
  authorFilter = '';
  nameFilter = '';

  constructor(
    private elemRef: ElementRef,
    private myFichiersService: DataService,
    private dexieService: DexieService,
    private serviceUtils: UtilsService
  ) {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.sort = { active: 'name', direction: 'desc' };
    this.myFichiersService.doneFichier$.pipe(skipWhile(done => done !== undefined && !done)).subscribe(() =>
      this.myFichiersService.getAll(this.dexieService.fichierTable).then(list => {
        this.dataList = this.sortList(list);
        this.length = list.length;
        this.displayedData = Utils.paginate(this.filter(this.dataList), this.page);
      }).catch(err => this.serviceUtils.handlePromiseError(err))
    );
  }

  filter(list: Fichier[]): Fichier[] {
    let result = list;
    if (this.nameFilter) {
      result = Utils.filterByFields(result, ['name'], this.nameFilter);
    }
    if (this.authorFilter) {
      result = Utils.filterByFields(result, ['author'], this.authorFilter);
    }
    if (this.filteredType) {
      result = Utils.filterByFields(result, ['type'], this.filteredType.code);
    }
    if (this.beginFilter) {
      result = result.filter(f => f.rangeBegin >= this.beginFilter);
    }
    if (this.endFilter) {
      result = result.filter(f => f.rangeEnd <= this.endFilter);
    }
    if (this.filteredCat && this.filteredCat.length > 0) {
      result = result.filter(f => this.filteredCat.map(filter => filter.code).includes(f.category));
    }
    this.length = result.length;
    return result;
  }

  sortList(list: Fichier[]): Fichier[] {
    return Utils.sortFichier(list, this.sort);
  }

  expand(element: Fichier): void {
    this.expandedElement = this.expandedElement === element ? undefined : element;
    if (this.expandedElement) {
      this.onSortComposition({ active: 'rank', direction: 'asc' });
    }
  }

  onSortComposition(sort: Sort): void {
    this.pageComposition = this.initPagination() ;
    const list = Utils.sortComposition(this.expandedElement.compoList, sort);
    this.displayedCompositions = Utils.paginate(list, this.pageComposition);
    this.expandedCompositions.next(list);
  }

  onPaginateCompositionChange(): void {
    this.displayedCompositions = Utils.paginate(this.expandedCompositions.getValue(), this.pageComposition);
  }

  goTop(): void {
    this.elemRef.nativeElement.querySelector('.filters').scrollIntoView();
  }
}
