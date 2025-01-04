import {Component, Inject, OnInit} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {of, switchMap} from 'rxjs';
import {catchError, skipWhile, tap} from 'rxjs/operators';
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator';

import {ListDirective} from '../list/list.component';
import {
  Fichier,
  Composition,
  Sort,
  Field,
  Dropdown,
  isComposition,
  isFichier,
  CompositionLight,
} from '@utils/model';
import {DataService} from '@services/data.service';
import {UtilsService} from '@services/utils.service';
import {DexieService} from '@services/dexie.service';
import {Utils} from '@utils/utils';
import {Dropbox} from '@utils/dropbox';
import {
  FormGroup,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  NonNullableFormBuilder,
} from '@angular/forms';
import {yearsValidator} from '@utils/year.validator';
import {NavigationService} from '@services/navigation.service';
import {faCheck} from '@fortawesome/free-solid-svg-icons';
import {TitlePipe} from '../pipes/title.pipe';
import {GoToTopComponent} from '../go-to-top/go-to-top.component';
import {RowActionDirective} from '../row-action/row-action.directive';
import {RowMenuComponent} from '../row-menu/row-menu.component';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
import {MatRippleModule} from '@angular/material/core';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {NgClass, DecimalPipe, TitleCasePipe} from '@angular/common';
import {FilterYearComponent} from '../filter-year/filter-year.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {FilterInputComponent} from '../filter-input/filter-input.component';
import {FilterSelectComponent} from '../filter-select/filter-select.component';
import {PaginatorComponent} from '../paginator/paginator.component';
import {PaginatorService} from '@services/paginator.service';
import {PAGINATOR} from '@utils/paginator.token';

@Component({
  selector: 'app-list-fichier',
  templateUrl: './list-fichier.component.html',
  styleUrls: ['./list-fichier.component.scss'],
  providers: [
    DataService,
    {
      provide: PAGINATOR,
      useFactory: () => new PaginatorService('fichier'),
      multi: true,
    },
    {
      provide: PAGINATOR,
      useFactory: () => new PaginatorService('composition'),
      multi: true,
    },
  ],
  animations: [
    trigger('compositionExpand', [
      state(
        'collapsed',
        style({height: '0px', minHeight: '0', display: 'none'}),
      ),
      state('expanded', style({height: '*'})),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'),
      ),
    ]),
  ],
  standalone: true,
  imports: [
    FilterSelectComponent,
    FilterInputComponent,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    FilterYearComponent,
    MatPaginatorModule,
    FontAwesomeModule,
    MatRippleModule,
    MatTableModule,
    MatSortModule,
    PaginatorComponent,
    RowMenuComponent,
    RowActionDirective,
    NgClass,
    GoToTopComponent,
    DecimalPipe,
    TitleCasePipe,
    TitlePipe,
  ],
})
export class ListFichierComponent
  extends ListDirective<Fichier>
  implements OnInit
{
  displayedColumns: Field<Fichier>[] = [
    'author',
    'name',
    'type',
    'category',
    'size',
    'publish',
    'sorted',
  ];

  override compositionColumns: (Field<Composition> | 'menu')[] = [
    'artist',
    'title',
    'rank',
    'size',
    'score',
  ];

  override displayedColumnsComposition = [...this.compositionColumns];
  expandedCompositions: CompositionLight[] = [];
  displayedCompositions: CompositionLight[] = [];
  sortComposition?: Sort<CompositionLight>;
  faCheck = faCheck;
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
      author: this.fb.control(''),
      name: this.fb.control(''),
      type: this.fb.control(''),
      deleted: this.fb.control(false),
      category: this.fb.control([]),
      top: this.fb.control(false),
      begin: this.fb.control(undefined),
      end: this.fb.control(undefined),
    },
    {validators: yearsValidator},
  );

  fichierPaginator?: PaginatorService;
  compositionPaginator?: PaginatorService;

  constructor(
    private myFichiersService: DataService<Fichier>,
    private dexieService: DexieService,
    protected serviceUtils: UtilsService,
    private navigationService: NavigationService,
    private fb: NonNullableFormBuilder,
    @Inject(PAGINATOR) paginatorService: PaginatorService[],
  ) {
    super(
      serviceUtils,
      paginatorService.find(p => p.id === 'fichier') ??
        new PaginatorService(''),
    );
    this.fichierPaginator = paginatorService.find(p => p.id === 'fichier');
    this.compositionPaginator = paginatorService.find(
      p => p.id === 'composition',
    );
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.listenNavigation();
    this.filters.valueChanges.subscribe(() => this.onSearch());
    this.sort = {active: 'size', direction: 'desc'};
    this.myFichiersService
      .loadsList(
        this.dexieService.fichierTable,
        this.dexieService.fileFichier,
        Dropbox.DROPBOX_FICHIER_FILE,
      )
      .pipe(
        skipWhile(done => done !== undefined && !done),
        switchMap(() => this.dexieService.fichierTable.getAll()),
        catchError(err =>
          this.utilsService.handleError(
            err,
            'Error when reading fichiers table',
          ),
        ),
        tap(list => {
          this.dataList = list;
          this.authors = list
            .map(l => [l.author?.trim() ?? ''])
            .reduce((acc, curr) => {
              if (acc.every(a => !curr.includes(a))) {
                acc.push(...curr);
              }
              return acc;
            })
            .sort()
            .map(l => ({label: l, code: l}));
        }),
        switchMap(() => this.fichierPaginator?.page ?? of(new PageEvent())),
        tap(
          p =>
            (this.displayedData = Utils.paginate(
              this.sortList(this.filter(this.dataList, true)),
              p,
            )),
        ),
      )
      .subscribe(() =>
        this.fichierPaginator?.updatePage({
          length: this.dataList.length,
        }),
      );
  }

  private listenNavigation(): void {
    this.navigationService.fichier.obs$.subscribe(f => {
      this.filters.reset();
      if (f.name) {
        const parsed = DataService.parseName(f.name);
        this.filters.controls.name.setValue(parsed.name);
        this.filters.controls.author.setValue(parsed.author);
        this.filters.controls.begin.setValue(+parsed.publish);
        this.filters.controls.end.setValue(+parsed.publish);
      }
      if (f.publish) {
        this.filters.controls.begin.setValue(+f.publish);
        this.filters.controls.end.setValue(+f.publish);
      }
      if (f.category) {
        this.filters.controls.category.setValue([f.category]);
      }
    });
  }

  filter(list: Fichier[], firstPage: boolean): Fichier[] {
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
        f => (f.publish ?? 0) >= (controls.begin.value ?? 0),
      );
    }
    if (controls.end.value) {
      result = result.filter(
        f => (f.publish ?? 0) <= (controls.end.value ?? 0),
      );
    }
    if (controls.category.value.length > 0) {
      result = result.filter(f =>
        controls.category.value?.includes(f.category),
      );
    }
    result = this.filterComposition(result);
    this.fichierPaginator?.updatePage({
      length: result.length,
      pageIndex: firstPage ? 0 : undefined,
    });
    return result;
  }

  filterComposition(list: Fichier[]): Fichier[] {
    const result = list;
    const controls = this.filters.controls;
    result.forEach(f => (f.displayedCompoList = f.compoList));
    if (!controls.deleted.value) {
      result.forEach(
        f =>
          (f.displayedCompoList = f.displayedCompoList.filter(c => !c.deleted)),
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
      f => f.displayedCompoList && f.displayedCompoList.length > 0,
    );
  }

  sortList(list: Fichier[]): Fichier[] {
    return Utils.sort(list, this.sort?.active, this.sort?.direction);
  }

  expand(element: Fichier): void {
    this.expandedElement =
      this.expandedElement === element ? undefined : element;
    if (this.expandedElement) {
      this.sortComposition = element.sorted
        ? {
            active: 'rank',
            direction: 'asc',
          }
        : {active: 'score', direction: 'desc'};
      this.onSortComposition(this.sortComposition);
    }
  }

  onSortComposition(sort: Sort<CompositionLight>): void {
    if (this.expandedElement) {
      this.sortComposition = sort;
      this.expandedElement = this.filterComposition([this.expandedElement])[0];
      this.expandedCompositions =
        this.expandedElement?.displayedCompoList ?? [];
      this.compositionPaginator?.updatePage({
        length: this.expandedCompositions.length,
        pageIndex: 0,
      });
      this.compositionPaginator?.page.subscribe(
        p =>
          (this.displayedCompositions = Utils.paginate(
            Utils.sort(this.expandedCompositions, sort.active, sort.direction),
            p,
          )),
      );
    }
  }

  onPaginateCompositionChange(): void {
    this.compositionPaginator?.page.subscribe(
      p =>
        (this.displayedCompositions = Utils.paginate(
          this.expandedCompositions,
          p,
        )),
    );
  }

  switchTab<T extends Composition | Fichier>(
    data: T,
    column: Field<T> | 'menu',
  ): void {
    if (isComposition(data)) {
      this.navigationService.setTab('Composition');
      if (column === 'title') {
        this.navigationService.composition.set(data);
      } else if (column === 'artist') {
        this.navigationService.composition.set({artist: data.artist});
      }
    } else if (isFichier(data)) {
      this.navigationService.setTab('Fichier');
      if (column === 'category') {
        this.navigationService.fichier.set({category: data.category});
      } else if (column === 'publish') {
        this.navigationService.fichier.set({publish: data.publish});
      }
    }
  }
}
