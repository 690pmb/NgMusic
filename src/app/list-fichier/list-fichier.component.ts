import {Component, OnInit, ViewChild} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {BehaviorSubject, switchMap} from 'rxjs';
import {catchError, skipWhile} from 'rxjs/operators';
import {MatPaginator, PageEvent} from '@angular/material/paginator';

import {ListDirective} from '../list/list.component';
import {Fichier, Composition, Sort, Field, Dropdown} from '@utils/model';
import {DataService} from '@services/data.service';
import {UtilsService} from '@services/utils.service';
import {DexieService} from '@services/dexie.service';
import {Utils} from '@utils/utils';
import {Dropbox} from '@utils/dropbox';
import {FormGroup, FormControl} from '@angular/forms';
import {yearsValidator} from '@utils/year.validator';
import {NavigationService} from '@services/navigation.service';

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

  displayedColumns: Field<Fichier>[] = [
    'author',
    'name',
    'type',
    'category',
    'size',
    'publish',
  ];

  override compositionColumns: (Field<Composition> | 'menu')[] = [
    'artist',
    'title',
    'rank',
    'size',
    'score',
  ];

  override displayedColumnsComposition = [...this.compositionColumns];
  expandedCompositions: Composition[] = [];
  displayedCompositions = new BehaviorSubject<Composition[]>([]);
  pageComposition!: PageEvent;
  sortComposition?: Sort<Composition>;
  expandedElement?: Fichier;
  expandedColumn = 'compositions';
  authors!: Dropdown[];
  // Filters
  filters = new FormGroup<{
    author: FormControl<string>;
    name: FormControl<string>;
    type: FormControl<string>;
    deleted: FormControl<boolean>;
    category: FormControl<string[]>;
    top: FormControl<boolean>;
    begin: FormControl<number | undefined>;
    end: FormControl<number | undefined>;
  }>(
    {
      author: new FormControl(),
      name: new FormControl(),
      type: new FormControl<string>('', {
        nonNullable: true,
      }),
      deleted: new FormControl(),
      category: new FormControl<string[]>([], {
        nonNullable: true,
      }),
      top: new FormControl(),
      begin: new FormControl(),
      end: new FormControl(),
    },
    {validators: yearsValidator}
  );

  constructor(
    private myFichiersService: DataService<Fichier>,
    private dexieService: DexieService,
    protected serviceUtils: UtilsService,
    private navigationService: NavigationService
  ) {
    super(serviceUtils);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.navigationService.fichier.obs$.subscribe(f => {
      this.filters.reset();
      const parsed = DataService.parseName(f.name);
      this.filters.controls.name.setValue(parsed.name);
      this.filters.controls.author.setValue(parsed.author);
      this.filters.controls.begin.setValue(+parsed.publish);
      this.filters.controls.end.setValue(+parsed.publish);
    });
    this.filters.valueChanges.subscribe(() => {
      this.paginator.firstPage();
      this.onSearch();
    });
    this.myFichiersService.loadsList(
      this.dexieService.fichierTable,
      this.dexieService.fileFichier,
      Dropbox.DROPBOX_FICHIER_FILE
    );
    this.sort = {active: 'size', direction: 'desc'};
    this.myFichiersService.done$
      .pipe(
        skipWhile(done => done !== undefined && !done),
        switchMap(() => this.dexieService.fichierTable.getAll()),
        catchError(err =>
          this.utilsService.handleError(
            err,
            'Error when reading fichiers table'
          )
        )
      )
      .subscribe(list => {
        this.dataList = this.sortList(list);
        this.length = list.length;
        this.authors = list
          .map(l => [l.author?.trim() ?? ''])
          .reduce((acc, curr) => {
            if (acc.every(a => !curr.includes(a))) {
              acc.push(...curr);
            }
            return acc;
          })
          .sort()
          .map(l => new Dropdown(l, l));
        this.displayedData = Utils.paginate(
          this.filter(this.dataList),
          this.page
        );
      });
  }

  filter(list: Fichier[]): Fichier[] {
    let result = list;
    const controls = this.filters.controls;
    if (controls.name.value) {
      result = Utils.filterByFields(result, 'name', controls.name.value);
    }
    if (controls.author.value) {
      result = Utils.filterByFields(result, 'author', controls.author.value);
    }
    if (controls.type.value) {
      result = Utils.filterByFields(result, 'type', controls.type.value);
    }
    if (controls.begin.value) {
      result = result.filter(
        f => (f.publish ?? 0) >= (controls.begin.value ?? 0)
      );
    }
    if (controls.end.value) {
      result = result.filter(
        f => (f.publish ?? 0) <= (controls.end.value ?? 0)
      );
    }
    if (controls.category.value.length > 0) {
      result = result.filter(f =>
        controls.category.value?.includes(f.category)
      );
    }
    result = this.filterComposition(result);
    this.length = result.length;
    return result;
  }

  filterComposition(list: Fichier[]): Fichier[] {
    const result = list;
    const controls = this.filters.controls;
    result.forEach(f => (f.displayedCompoList = f.compoList));
    if (!controls.deleted.value) {
      result.forEach(
        f =>
          (f.displayedCompoList = f.displayedCompoList.filter(c => !c.deleted))
      );
    }
    if (controls.top.value) {
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
    return Utils.sort(list, this.sort?.active, this.sort?.direction);
  }

  expand(element: Fichier): void {
    this.expandedElement =
      this.expandedElement === element ? undefined : element;
    if (this.expandedElement) {
      this.sortComposition = {active: 'rank', direction: 'asc'};
      this.onSortComposition(this.sortComposition);
    }
  }

  onSortComposition(sort: Sort<Composition>): void {
    if (this.expandedElement) {
      this.pageComposition = this.initPagination();
      this.sortComposition = sort;
      this.expandedElement = this.filterComposition([this.expandedElement])[0];
      this.displayedCompositions.next(
        Utils.sort(
          this.expandedElement?.displayedCompoList ?? [],
          sort.active,
          sort.direction
        )
      );
      this.expandedCompositions = this.displayedCompositions.getValue();
    }
  }

  onPaginateCompositionChange(): void {
    this.displayedCompositions.next(
      Utils.paginate(this.expandedCompositions, this.pageComposition)
    );
  }

  switchTab(compo: Composition, column: string): void {
    if (column === 'title') {
      this.navigationService.setTab('Composition');
      this.navigationService.composition.set(compo);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  trackByFn(_index: number, item: string): string {
    return item;
  }
}
