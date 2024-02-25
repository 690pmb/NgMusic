import {Component, OnInit, ViewChild} from '@angular/core';
import {catchError, skipWhile} from 'rxjs/operators';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {BehaviorSubject, switchMap} from 'rxjs';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';

import {
  Composition,
  Fichier,
  Field,
  Sort,
  isComposition,
  isFichier,
} from '@utils/model';
import {Utils} from '@utils/utils';
import {DataService} from '@services/data.service';
import {UtilsService} from '@services/utils.service';
import {ListDirective} from '../list/list.component';
import {DexieService} from '@services/dexie.service';
import {Dropbox} from '@utils/dropbox';
import {yearsValidator} from '@utils/year.validator';
import {NavigationService} from '@services/navigation.service';
import {UpperFirstPipe} from '../pipes/upper-first.pipe';
import {TitlePipe} from '../pipes/title.pipe';
import {GoToTopComponent} from '../go-to-top/go-to-top.component';
import {RowActionDirective} from '../row-action/row-action.directive';
import {RowMenuComponent} from '../row-menu/row-menu.component';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
import {MatRippleModule} from '@angular/material/core';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {NgIf, NgFor, NgClass, DecimalPipe} from '@angular/common';
import {FilterYearComponent} from '../filter-year/filter-year.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {FilterSelectComponent} from '../filter-select/filter-select.component';
import {FilterInputComponent} from '../filter-input/filter-input.component';

@Component({
  selector: 'app-list-composition',
  templateUrl: './list-composition.component.html',
  styleUrls: ['./list-composition.component.scss'],
  providers: [{provide: DataService, useClass: DataService}],
  animations: [
    trigger('detailExpand', [
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
  standalone: true,
  imports: [
    FilterInputComponent,
    FilterSelectComponent,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    FilterYearComponent,
    NgIf,
    FontAwesomeModule,
    MatRippleModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    RowMenuComponent,
    NgFor,
    NgClass,
    RowActionDirective,
    GoToTopComponent,
    DecimalPipe,
    TitlePipe,
    UpperFirstPipe,
  ],
})
export class ListCompositionComponent
  extends ListDirective<Composition>
  implements OnInit
{
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  override compositionColumns: Field<Composition>[] = [
    'artist',
    'title',
    'type',
    'displayedFileList',
    'score',
  ];

  override displayedColumnsComposition = [...this.compositionColumns];
  displayedColumnsFichier: Field<Fichier>[] = [
    'name',
    'category',
    'rangeBegin',
    'rangeEnd',
    'rank',
    'size',
  ];

  displayedFichier = new BehaviorSubject<Fichier[]>([]);
  sortFichier?: Sort<Fichier>;
  expandedColumn = 'details';
  // Filters
  filters = new FormGroup<{
    artist: FormControl<string>;
    title: FormControl<string>;
    filename: FormControl<string>;
    type: FormControl<string>;
    deleted: FormControl<boolean>;
    category: FormControl<string[]>;
    begin: FormControl<number | undefined>;
    end: FormControl<number | undefined>;
  }>(
    {
      artist: new FormControl<string>('', {
        nonNullable: true,
      }),
      title: new FormControl<string>('', {
        nonNullable: true,
      }),
      filename: new FormControl<string>('', {
        nonNullable: true,
      }),
      type: new FormControl<string>('', {nonNullable: true}),
      deleted: new FormControl<boolean>(false, {nonNullable: true}),
      category: new FormControl<string[]>([], {
        nonNullable: true,
      }),
      begin: new FormControl<number | undefined>(undefined, {
        nonNullable: true,
      }),
      end: new FormControl<number | undefined>(undefined, {nonNullable: true}),
    },
    {validators: yearsValidator}
  );

  constructor(
    private myCompositionsService: DataService<Composition>,
    private dexieService: DexieService,
    protected serviceUtils: UtilsService,
    private navigationService: NavigationService
  ) {
    super(serviceUtils);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.navigationService.composition.obs$.subscribe(c => {
      this.filters.reset();
      if (c.artist) {
        this.filters.controls.artist.setValue(c.artist);
      }
      if (c.title) {
        this.filters.controls.title.setValue(c.title);
      }
    });
    this.filters.valueChanges.subscribe(() => {
      this.paginator.firstPage();
      this.onSearch();
    });
    this.myCompositionsService.loadsList(
      this.dexieService.compositionTable,
      this.dexieService.fileComposition,
      Dropbox.DROPBOX_COMPOSITION_FILE
    );
    this.sort = {active: 'score', direction: 'desc'};
    this.myCompositionsService.done$
      .pipe(
        skipWhile(done => done !== undefined && !done),
        switchMap(() => this.dexieService.compositionTable.getAll()),
        catchError((err: unknown) =>
          this.utilsService.handleError(
            err,
            'Error when reading compositions table'
          )
        )
      )
      .subscribe(list => {
        this.dataList = list;
        this.length = list.length;
        this.displayedData = Utils.paginate(
          this.sortList(this.filter(this.dataList)),
          this.page
        );
      });
  }

  filter(list: Composition[]): Composition[] {
    // Composition filters
    let result = this.filterOnComposition(list);
    // Fichier filters
    result = this.filterOnFichier(result);
    this.length = result.length;
    this.onSortFichier(this.sortFichier);
    return result;
  }

  filterOnComposition(list: Composition[]): Composition[] {
    let result = list;
    const controls = this.filters.controls;
    if (controls.artist.value) {
      result = Utils.filterByFields(result, 'sArtist', controls.artist.value);
    }
    if (controls.title.value) {
      result = Utils.filterByFields(result, 'sTitle', controls.title.value);
    }
    if (controls.type.value) {
      result = Utils.filterByFields(result, 'type', controls.type.value);
    }
    if (!controls.deleted.value) {
      result = result.filter(c => !c.deleted);
    }
    return result;
  }

  filterOnFichier(list: Composition[]): Composition[] {
    const result = list;
    const controls = this.filters.controls;
    result.forEach(c => (c.displayedFileList = c.fileList));
    if (controls.category.value.length > 0) {
      result.forEach(
        c =>
          (c.displayedFileList = c.displayedFileList.filter(f =>
            controls.category.value.includes(f.category)
          ))
      );
    }
    if (controls.filename.value) {
      result.forEach(
        c =>
          (c.displayedFileList = c.displayedFileList.filter(f =>
            f.name
              .toLowerCase()
              .includes(controls.filename.value.toLowerCase() ?? '')
          ))
      );
    }
    if (controls.begin.value) {
      result.forEach(
        c =>
          (c.displayedFileList = c.displayedFileList.filter(
            f => f.rangeBegin >= (controls.begin?.value ?? 0)
          ))
      );
    }
    if (controls.end.value) {
      result.forEach(
        c =>
          (c.displayedFileList = c.displayedFileList.filter(
            f => f.rangeEnd <= (controls.end?.value ?? 0)
          ))
      );
    }
    return result.filter(
      c => c.displayedFileList && c.displayedFileList.length > 0
    );
  }

  sortList(list: Composition[]): Composition[] {
    return Utils.sort(list, this.sort?.active, this.sort?.direction);
  }

  expand(element: Composition): void {
    this.expandedElement =
      this.expandedElement === element ? undefined : element;
    if (this.expandedElement) {
      this.sortFichier = {active: 'rank', direction: 'asc'};
      this.displayedFichier.next(
        Utils.sort(
          this.expandedElement.displayedFileList,
          this.sortFichier.active,
          this.sortFichier.direction
        )
      );
    }
  }

  onSortFichier(sort?: Sort<Fichier>): void {
    if (this.expandedElement) {
      this.sortFichier = sort;
      this.expandedElement = this.filterOnFichier([this.expandedElement])[0];
      this.displayedFichier.next(
        Utils.sort(
          this.expandedElement?.displayedFileList ?? [],
          sort?.active,
          sort?.direction
        )
      );
    }
  }

  switchTab<T extends Composition | Fichier>(data: T, column: Field<T>): void {
    if (column === 'name' && isFichier(data)) {
      this.navigationService.setTab('Fichier');
      this.navigationService.fichier.set(data);
    } else if (column === 'artist' && isComposition(data)) {
      this.navigationService.composition.set({artist: data.artist});
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  trackByFn(_index: number, item: string): string {
    return item;
  }
}
