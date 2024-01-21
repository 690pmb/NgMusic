import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {MenuService} from '@services/menu.service';
import {Composition} from '@utils/model';

export type MenuButton = {
  text: string;
  icon: string[];
  click: () => void;
};

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit, OnDestroy {
  @Input()
  composition!: Composition;

  @Input()
  isButton = false;

  wiki = {
    $implicit: {
      text: 'Wikipedia',
      icon: ['fab', 'wikipedia-w'],
      click: () => this.menuService.openWiki(),
    } as MenuButton,
  };

  copy = {
    $implicit: {
      text: 'Copier',
      icon: ['far', 'copy'],
      click: () => this.menuService.compositionInClipBoard(),
    } as MenuButton,
  };

  constructor(protected menuService: MenuService) {}

  ngOnInit(): void {
    this.menuService.getWikiUrl(this.composition);
  }

  ngOnDestroy(): void {
    this.menuService.setWiki('');
  }
}
