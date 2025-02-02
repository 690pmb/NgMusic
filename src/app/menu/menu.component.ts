import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {MenuService} from '@services/menu.service';
import {Composition} from '@utils/model';
import {MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {MatMenuModule} from '@angular/material/menu';
import {NgTemplateOutlet, AsyncPipe} from '@angular/common';

export type MenuButton = Record<
  '$implicit',
  {text: string; icon: [string, string]; click: () => void}
>;

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  standalone: true,
  imports: [
    NgTemplateOutlet,
    MatMenuModule,
    FontAwesomeModule,
    MatButtonModule,
    MatDialogModule,
    AsyncPipe,
  ],
})
export class MenuComponent implements OnInit, OnDestroy {
  @Input({required: true})
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
    this.menuService.wiki.set('');
  }
}
