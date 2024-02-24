import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {Composition} from '../utils/model';
import {MenuComponent} from '../menu/menu.component';

export type MenuDialogData = {composition: Composition};

@Component({
  selector: 'app-menu-dialog',
  templateUrl: './menu-dialog.component.html',
  styleUrls: ['./menu-dialog.component.scss'],
  standalone: true,
  imports: [MatDialogModule, MenuComponent],
})
export class MenuDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: MenuDialogData) {}
}
