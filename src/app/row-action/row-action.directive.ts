import {AfterViewInit, Directive, ElementRef, Input} from '@angular/core';
import {fromEvent, filter, merge, map, tap, debounceTime} from 'rxjs';
import {Composition} from '../utils/model';
import {MatDialog} from '@angular/material/dialog';
import {
  MenuDialogComponent,
  MenuDialogData,
} from '../menu-dialog/menu-dialog.component';

@Directive({
  selector: 'mat-row[appRowAction]',
  standalone: true,
})
export class RowActionDirective implements AfterViewInit {
  @Input()
  appRowAction!: Composition;

  @Input()
  isMobile = false;

  private readonly threshold = 900;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private dialog: MatDialog
  ) {}

  ngAfterViewInit(): void {
    let out = true;
    const touchStart$ = fromEvent<TouchEvent>(
      this.elementRef.nativeElement,
      'touchstart'
    ).pipe(
      tap(() => (out = true)),
      debounceTime(this.threshold),
      map(() => true)
    );
    const touchEnd$ = fromEvent<TouchEvent>(
      this.elementRef.nativeElement,
      'touchend'
    ).pipe(map(() => false));
    const touchLeave$ = fromEvent<TouchEvent>(
      this.elementRef.nativeElement,
      'touchleave'
    ).pipe(map(() => false));

    merge(touchStart$, touchLeave$, touchEnd$)
      .pipe(
        tap(v => (out = out && v)),
        filter(() => out && this.isMobile)
      )
      .subscribe(() => {
        this.dialog.open<MenuDialogComponent, MenuDialogData>(
          MenuDialogComponent,
          {
            data: {composition: this.appRowAction},
          }
        );
      });
  }
}
