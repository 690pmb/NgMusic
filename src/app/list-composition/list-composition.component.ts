import {Component, OnInit, ElementRef} from '@angular/core';
import {Sort} from '@angular/material/sort';
import {faTimesCircle} from '@fortawesome/free-regular-svg-icons';
import {skipWhile} from 'rxjs/operators';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {BehaviorSubject} from 'rxjs';
import {faAngleUp} from '@fortawesome/free-solid-svg-icons';
import {FaIconLibrary} from '@fortawesome/angular-fontawesome';

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
  displayedColumns = ['artist', 'title', 'type', 'sizeC', 'score'];
  displayedColumnsFichier = [
    'name',
    'category',
    'rangeBegin',
    'rangeEnd',
    'size',
    'rank',
  ];

  displayedFichier = new BehaviorSubject([]);
  sortFichier: Sort;
  expandedElement: Composition;
  expandedColumn = 'details';
  faAngleUp = faAngleUp;
  // Filters
  artistFilter = '';
  titleFilter = '';
  filenameFilter = '';
  deleted = false;

  constructor(
    private elemRef: ElementRef,
    private myCompositionsService: DataService<Composition>,
    private dexieService: DexieService,
    private serviceUtils: UtilsService,
    library: FaIconLibrary
  ) {
    super();
    library.addIcons(faAngleUp, faTimesCircle);
  }

  ngOnInit(): void {
    super.ngOnInit();
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
    if (this.artistFilter) {
      result = Utils.filterByFields(result, 'sArtist', this.artistFilter);
    }
    if (this.titleFilter) {
      result = Utils.filterByFields(result, 'sTitle', this.titleFilter);
    }
    if (this.filteredType) {
      result = Utils.filterByFields(result, 'type', this.filteredType.code);
    }
    if (!this.deleted) {
      result = result.filter(c => !c.deleted);
    }
    return result;
  }

  filterOnFichier(list: Composition[]): Composition[] {
    const result = list;
    result.forEach(c => (c.displayedFileList = c.fileList));
    if (this.filteredCat && this.filteredCat.length > 0) {
      result.forEach(
        c =>
          (c.displayedFileList = c.displayedFileList.filter(f =>
            this.filteredCat.map(filter => filter.code).includes(f.category)
          ))
      );
    }
    if (this.filenameFilter) {
      result.forEach(
        c =>
          (c.displayedFileList = c.displayedFileList.filter(f =>
            f.name.toLowerCase().includes(this.filenameFilter.toLowerCase())
          ))
      );
    }
    if (this.beginFilter) {
      result.forEach(
        c =>
          (c.displayedFileList = c.displayedFileList.filter(
            f => f.rangeBegin >= this.beginFilter
          ))
      );
    }
    if (this.endFilter) {
      result.forEach(
        c =>
          (c.displayedFileList = c.displayedFileList.filter(
            f => f.rangeEnd <= this.endFilter
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

  goTop(): void {
    this.elemRef.nativeElement.querySelector('.filters').scrollIntoView();
  }
}
