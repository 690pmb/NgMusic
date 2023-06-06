import {Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable({providedIn: 'root'})
export class ToastService {
  constructor(public snackBar: MatSnackBar) {}

  open(message: string): void {
    this.snackBar.open(message, undefined, {
      duration: 1500,
    });
  }
}
