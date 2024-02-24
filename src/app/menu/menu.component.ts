import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {MenuService} from '@services/menu.service';
import {Composition} from '@utils/model';
import {MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {MatMenuModule} from '@angular/material/menu';
import {NgIf, NgFor, NgTemplateOutlet, AsyncPipe} from '@angular/common';

export type MenuButton = {
  $implicit: {
    text: string;
    icon: string[];
    click: () => void;
  };
};

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgTemplateOutlet,
    MatMenuModule,
    FontAwesomeModule,
    MatButtonModule,
    MatDialogModule,
    AsyncPipe,
  ],
})
export class MenuComponent implements OnInit, OnDestroy {
  @Input()
  composition!: Composition;

  @Input()
  isButton = false;

  buttons: MenuButton[] = [
    {
      $implicit: {
        text: 'Copier',
        icon: ['far', 'copy'],
        click: () => this.menuService.compositionInClipBoard(),
      },
    },
    {
      $implicit: {
        text: 'Wikipedia',
        icon: ['fab', 'wikipedia-w'],
        click: () => this.menuService.openWiki(),
      },
    },
    {
      $implicit: {
        text: 'Google',
        icon: ['fab', 'google'],
        click: () => this.menuService.openGoogle(),
      },
    },
  ];

  constructor(protected menuService: MenuService) {}

  ngOnInit(): void {
    this.menuService.getWikiUrl(this.composition);
  }

  ngOnDestroy(): void {
    this.menuService.setWiki('');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  trackByFn(_index: number, button: MenuButton): string {
    return button.$implicit.text;
  }
}
