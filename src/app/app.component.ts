import {Component, OnInit} from '@angular/core';

import {DataService} from './services/data.service';
import {Dropbox} from './utils/dropbox';
import {DexieService} from './services/dexie.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'app';
  tabs = 'c';

  constructor(
    private dataService: DataService,
    private dexieService: DexieService
  ) {}

  ngOnInit(): void {
    this.dataService.loadsList(
      this.dexieService.compositionTable,
      this.dexieService.fileComposition,
      Dropbox.DROPBOX_COMPOSITION_FILE,
      true
    );
    this.dataService.loadsList(
      this.dexieService.fichierTable,
      this.dexieService.fileFichier,
      Dropbox.DROPBOX_FICHIER_FILE,
      false
    );
  }
}
