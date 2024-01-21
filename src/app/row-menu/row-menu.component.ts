import {Component, Input} from '@angular/core';
import {Composition} from '@utils/model';
import {MenuService} from '../services/menu.service';

@Component({
  selector: 'app-row-menu',
  templateUrl: './row-menu.component.html',
  styleUrls: ['./row-menu.component.scss'],
})
export class RowMenuComponent {
  @Input()
  composition!: Composition;

  constructor(protected menuService: MenuService) {}
}
