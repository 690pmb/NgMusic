import {Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import {faAngleUp} from '@fortawesome/free-solid-svg-icons';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {BehaviorSubject} from 'rxjs';
import {skipWhile} from 'rxjs/operators';
import {Sort} from '@angular/material/sort';
import {MatPaginator, PageEvent} from '@angular/material/paginator';

import {ListDirective} from '../list/list.component';
import {Fichier, Composition} from '@utils/model';
import {DataService} from '@services/data.service';
import {UtilsService} from '@services/utils.service';
import {DexieService} from '@services/dexie.service';
import {Utils} from '@utils/utils';
import {Dropbox} from '@utils/dropbox';
import {FormGroup, FormControl} from '@angular/forms';

@Component({
  selector: 'app-list-fichier',
  templateUrl: './list-fichier.component.html',
  styleUrls: ['./list-fichier.component.scss'],
  providers: [{provide: DataService, useClass: DataService}],
  animations: [
    trigger('compositionExpand', [
      state(
        'collapsed',
        style({height: '0px', minHeight: '0', display: 'none'})
      ),
      state('expanded', style({height: '*'})),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class ListFichierComponent
  extends ListDirective<Fichier>
  implements OnInit
{
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  displayedColumns = ['author', 'name', 'type', 'category', 'sizeF', 'publish'];
  displayedColumnsComposition = ['artist', 'title', 'rank', 'size', 'score'];
  expandedCompositions: Composition[];
  displayedCompositions = new BehaviorSubject([]);
  pageComposition: PageEvent;
  sortComposition: Sort;
  expandedElement: Fichier;
  expandedColumn = 'compositions';
  faAngleUp = faAngleUp;
  // Filters
  filters = new FormGroup<{
    author: FormControl<string>;
    name: FormControl<string>;
    type: FormControl<string | undefined>;
    category: FormControl<string[] | undefined>;
  }>({
    author: new FormControl(),
    name: new FormControl(),
    type: new FormControl(),
    category: new FormControl(),
  });

  deleted = false;
  top = false;

  constructor(
    private elemRef: ElementRef,
    private myFichiersService: DataService<Fichier>,
    private dexieService: DexieService,
    private serviceUtils: UtilsService
  ) {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.filters.valueChanges.subscribe(() => {
      this.paginator.firstPage();
      this.onSearch();
    });
    this.myFichiersService.loadsList(
      this.dexieService.fichierTable,
      this.dexieService.fileFichier,
      Dropbox.DROPBOX_FICHIER_FILE
    );
    this.sort = {active: 'name', direction: 'desc'};
    this.myFichiersService.done$
      .pipe(skipWhile(done => done !== undefined && !done))
      .subscribe(() =>
        DexieService.getAll(this.dexieService.fichierTable)
          .then(list => {
            this.dataList = this.sortList(list);
            this.length = list.length;
            this.displayedData = Utils.paginate(
              this.filter(this.dataList),
              this.page
            );
          })
          .catch(err => this.serviceUtils.handlePromiseError(err))
      );
  }

  filter(list: Fichier[]): Fichier[] {
    let result = list;
    if (this.filters.controls.name.value) {
      result = Utils.filterByFields(
        result,
        'name',
        this.filters.controls.name.value
      );
    }
    if (this.filters.controls.author.value) {
      result = Utils.filterByFields(
        result,
        'author',
        this.filters.controls.author.value
      );
    }
    if (this.filters.controls.type.value) {
      result = Utils.filterByFields(
        result,
        'type',
        this.filters.controls.type.value
      );
    }
    if (this.beginFilter) {
      result = result.filter(f => f.rangeBegin >= this.beginFilter);
    }
    if (this.endFilter) {
      result = result.filter(f => f.rangeEnd <= this.endFilter);
    }
    if (this.filters.controls.category.value?.length > 0) {
      result = result.filter(f =>
        this.filters.controls.category.value.includes(f.category)
      );
    }
    result = this.filterComposition(result);
    this.length = result.length;
    return result;
  }

  filterComposition(list: Fichier[]): Fichier[] {
    const result = list;
    result.forEach(f => (f.displayedCompoList = f.compoList));
    if (!this.deleted) {
      result.forEach(
        f =>
          (f.displayedCompoList = f.displayedCompoList.filter(c => !c.deleted))
      );
    }
    if (this.top) {
      result.forEach(f => {
        f.displayedCompoList = f.sorted
          ? f.displayedCompoList.filter(c => c.rank < 10)
          : [];
      });
    }
    return result.filter(
      f => f.displayedCompoList && f.displayedCompoList.length > 0
    );
  }

  sortList(list: Fichier[]): Fichier[] {
    return Utils.sortFichier(list, this.sort);
  }

  expand(element: Fichier): void {
    this.expandedElement =
      this.expandedElement === element ? undefined : element;
    if (this.expandedElement) {
      this.sortComposition = {active: 'rank', direction: 'asc'};
      this.onSortComposition(this.sortComposition);
    }
  }

  onSortComposition(sort: Sort): void {
    if (this.expandedElement) {
      this.pageComposition = this.initPagination();
      this.sortComposition = sort;
      this.expandedElement = this.filterComposition([this.expandedElement])[0];
      this.displayedCompositions.next(
        Utils.sortComposition(this.expandedElement.displayedCompoList, sort)
      );
      this.expandedCompositions = this.displayedCompositions.getValue();
    }
  }

  onPaginateCompositionChange(): void {
    this.displayedCompositions.next(
      Utils.paginate(this.expandedCompositions, this.pageComposition)
    );
  }

  goTop(): void {
    this.elemRef.nativeElement.querySelector('.filters').scrollIntoView();
  }
}
