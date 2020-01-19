import { Component, OnInit, ElementRef } from '@angular/core';
import { faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { BehaviorSubject } from 'rxjs';
import { skipWhile } from 'rxjs/operators';
import { Sort } from '@angular/material/sort';

import { ListComponent } from '../list/list.component';
import { Fichier } from '../utils/model';
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
  displayedCompositions = new BehaviorSubject([]);
  expandedElement: Fichier;
  expandedColumn = 'compositions';
  faAngleUp = faAngleUp;

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
        this.paginate(this.filter(this.dataList));
      }).catch(err => this.serviceUtils.handlePromiseError(err))
    );
  }

  filter(list: Fichier[]): Fichier[] {
    this.length = list.length;
    return list;
  }

  sortList(list: Fichier[]): Fichier[] {
    return list;
  }

  expand(element: Fichier): void {
    this.expandedElement = this.expandedElement === element ? undefined : element;
    if (this.expandedElement) {
      this.displayedCompositions.next(Utils.sortComposition(this.expandedElement.compoList, { active: 'rank', direction: 'asc' }));
    }
  }

  onSortComposition(sort: Sort): void {
    this.displayedCompositions.next(Utils.sortComposition(this.expandedElement.compoList, sort));
  }

  goTop(): void {
    this.elemRef.nativeElement.querySelector('.filters').scrollIntoView();
  }
}
