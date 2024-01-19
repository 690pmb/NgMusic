import {Component, OnInit, ViewChild} from '@angular/core';
import {Sort} from '@angular/material/sort';
import {skipWhile} from 'rxjs/operators';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {BehaviorSubject} from 'rxjs';
import {FormControl, FormGroup} from '@angular/forms';
import {MatPaginator} from '@angular/material/paginator';

import {Composition} from '@utils/model';
import {Utils} from '@utils/utils';
import {DataService} from '@services/data.service';
import {UtilsService} from '@services/utils.service';
import {ListDirective} from '../list/list.component';
import {DexieService} from '@services/dexie.service';
import {Dropbox} from '@utils/dropbox';

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
})
export class ListCompositionComponent
  extends ListDirective<Composition>
  implements OnInit
{
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  private readonly compositionColumns = [
    'artist',
    'title',
    'type',
    'sizeC',
    'score',
  ];

  displayedColumns = [...this.compositionColumns];
  displayedColumnsFichier = [
    'name',
    'category',
    'rangeBegin',
    'rangeEnd',
    'rank',
    'size',
  ];

  displayedFichier = new BehaviorSubject([]);
  sortFichier: Sort;
  expandedElement: Composition;
  expandedColumn = 'details';
  wikiUrl = '';
  // Filters
  filters = new FormGroup<{
    artist: FormControl<string>;
    title: FormControl<string>;
    filename: FormControl<string>;
    type: FormControl<string | undefined>;
    deleted: FormControl<boolean>;
    category: FormControl<string[] | undefined>;
    begin: FormControl<number | undefined>;
    end: FormControl<number | undefined>;
  }>({
    artist: new FormControl(),
    title: new FormControl(),
    filename: new FormControl(),
    type: new FormControl(),
    deleted: new FormControl(),
    category: new FormControl(),
    begin: new FormControl(),
    end: new FormControl(),
  });

  constructor(
    private myCompositionsService: DataService<Composition>,
    private dexieService: DexieService,
    private serviceUtils: UtilsService,
    protected utilsService: UtilsService
  ) {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.utilsService.isDesktop().subscribe(isDesktop => {
      if (isDesktop) {
        this.displayedColumns = [...this.compositionColumns, 'menu'];
      } else {
        this.displayedColumns = [...this.compositionColumns];
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
      .pipe(skipWhile(done => done !== undefined && !done))
      .subscribe(() =>
        DexieService.getAll(this.dexieService.compositionTable)
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
    if (controls.category.value?.length > 0) {
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
            f.name.toLowerCase().includes(controls.filename.value.toLowerCase())
          ))
      );
    }
    if (controls.begin.value) {
      result.forEach(
        c =>
          (c.displayedFileList = c.displayedFileList.filter(
            f => f.rangeBegin >= controls.begin.value
          ))
      );
    }
    if (controls.end.value) {
      result.forEach(
        c =>
          (c.displayedFileList = c.displayedFileList.filter(
            f => f.rangeEnd <= controls.end.value
          ))
      );
    }
    return result.filter(
      c => c.displayedFileList && c.displayedFileList.length > 0
    );
  }

  onSort(): void {
    super.onSort();
    this.displayedData = this.sortList(this.displayedData);
  }

  sortList(list: Composition[]): Composition[] {
    return Utils.sortComposition(list, this.sort);
  }

  expand(element: Composition): void {
    this.expandedElement =
      this.expandedElement === element ? undefined : element;
    if (this.expandedElement) {
      this.sortFichier = {active: 'rank', direction: 'asc'};
      this.displayedFichier.next(
        Utils.sortFichier(
          this.expandedElement.displayedFileList,
          this.sortFichier
        )
      );
    }
  }

  onSortFichier(sort: Sort): void {
    if (this.expandedElement) {
      this.sortFichier = sort;
      this.expandedElement = this.filterOnFichier([this.expandedElement])[0];
      this.displayedFichier.next(
        Utils.sortFichier(this.expandedElement.displayedFileList, sort)
      );
    }
  }

  wiki(compo: Composition): void {
    this.utilsService
      .wikisearch(compo.title)
      .subscribe(u => (this.wikiUrl = u));
  }

  openWiki(): void {
    window.open(this.wikiUrl);
  }
}
