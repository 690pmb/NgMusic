import { Component, OnInit, ElementRef } from '@angular/core';
import { faAngleUp } from '@fortawesome/free-solid-svg-icons';

import { ListComponent } from '../list/list.component';
import { Fichier } from '../utils/model';
import { DataService } from '../services/data.service';
import { UtilsService } from '../services/utils.service';
import { BehaviorSubject } from 'rxjs';
import { skipWhile } from 'rxjs/operators';
import { DexieService } from '../services/dexie.service';

@Component({
  selector: 'app-list-fichier',
  templateUrl: './list-fichier.component.html',
  styleUrls: ['./list-fichier.component.scss']
})
export class ListFichierComponent extends ListComponent<Fichier> implements OnInit {
  displayedColumns = ['name', 'type', 'category', 'size'];
  displayedColumnsComposition = ['artist', 'title', 'type', 'sizeC', 'score'];
  displayedCompositions = new BehaviorSubject([]);
  expandedElement: Fichier;
  // expandedColumn = 'details';
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

  goTop(): void {
    this.elemRef.nativeElement.querySelector('.filters').scrollIntoView();
  }
}
