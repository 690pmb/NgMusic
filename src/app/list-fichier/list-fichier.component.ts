import { Component, OnInit } from '@angular/core';

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

  constructor() { }

  ngOnInit(): void {
  }

}
