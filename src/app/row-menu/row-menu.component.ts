import {Component, Input} from '@angular/core';
import {Composition} from '@utils/model';
import {MenuService} from '../services/menu.service';
import {MenuComponent} from '../menu/menu.component';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-row-menu',
  templateUrl: './row-menu.component.html',
  styleUrls: ['./row-menu.component.scss'],
  standalone: true,
  imports: [MatButtonModule, MatMenuModule, FontAwesomeModule, MenuComponent],
})
export class RowMenuComponent {
  @Input()
  composition!: Composition;

  constructor(protected menuService: MenuService) {}
}
