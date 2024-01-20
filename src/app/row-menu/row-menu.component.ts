import {Component, Input} from '@angular/core';
import {UtilsService} from '@services/utils.service';
import {Composition} from '@utils/model';

@Component({
  selector: 'app-row-menu',
  templateUrl: './row-menu.component.html',
  styleUrls: ['./row-menu.component.scss'],
})
export class RowMenuComponent {
  @Input()
  composition!: Composition;

  wikiUrl = '';

  constructor(protected utilsService: UtilsService) {}

  wiki(): void {
    this.utilsService
      .wikisearch(this.composition.title)
      .subscribe(u => (this.wikiUrl = u));
  }

  openWiki(): void {
    window.open(this.wikiUrl);
  }
}
