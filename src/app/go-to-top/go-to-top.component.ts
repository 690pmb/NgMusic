import {ViewportScroller} from '@angular/common';
import {Component, HostListener} from '@angular/core';

@Component({
  selector: 'app-go-to-top',
  templateUrl: './go-to-top.component.html',
  styleUrls: ['./go-to-top.component.scss'],
})
export class GoToTopComponent {
  @HostListener('window:scroll')
  handleScroll(): void {
    this.hide = window.scrollY < window.innerHeight / 3;
  }

  hide = true;

  constructor(private scroll: ViewportScroller) {}

  goTop(): void {
    this.scroll.scrollToPosition([0, 0]);
  }
}
