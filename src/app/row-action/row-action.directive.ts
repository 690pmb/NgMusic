import {AfterViewInit, Directive, ElementRef, Input} from '@angular/core';
import {fromEvent, filter, merge, map, tap, debounceTime} from 'rxjs';
import {Composition} from '../utils/model';
import {UtilsService} from '@services/utils.service';

@Directive({
  selector: 'mat-row[appRowAction]',
})
export class RowActionDirective implements AfterViewInit {
  @Input()
  appRowAction!: Composition;

  @Input()
  isMobile = false;

  private readonly threshold = 1000;

  constructor(
    private elementRef: ElementRef,
    private utilsService: UtilsService
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
        this.utilsService.compositionInClipBoard(this.appRowAction);
      });
  }
}
