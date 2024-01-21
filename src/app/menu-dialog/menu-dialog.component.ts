import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Composition} from '../utils/model';

export type MenuDialogData = {composition: Composition};

@Component({
  selector: 'app-menu-dialog',
  templateUrl: './menu-dialog.component.html',
  styleUrls: ['./menu-dialog.component.scss'],
})
export class MenuDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: MenuDialogData) {}
}
