import {AfterViewInit, Directive, ElementRef, Input} from '@angular/core';
import {fromEvent, debounceTime, filter, tap, combineLatestWith} from 'rxjs';
import {Composition} from '../utils/model';
import {UtilsService} from '@services/utils.service';

@Directive({
  selector: 'mat-row[appRowAction]',
})
export class RowActionDirective implements AfterViewInit {
  @Input()
  appRowAction!: Composition;

  constructor(
    private el: ElementRef,
    private utilsService: UtilsService
  ) {}

  ngAfterViewInit(): void {
    let out = false;
    fromEvent(this.el.nativeElement as HTMLElement, 'mouseout').subscribe(
      () => (out = true)
    );
    fromEvent(this.el.nativeElement as HTMLElement, 'mouseover')
      .pipe(
        tap(() => (out = false)),
        debounceTime(1000),
        filter(() => !out),
        combineLatestWith(
          this.utilsService.isDesktop().pipe(filter(isDesktop => !isDesktop))
        )
      )
      .subscribe(() =>
        this.utilsService.compositionInClipBoard(this.appRowAction)
      );
  }
}
