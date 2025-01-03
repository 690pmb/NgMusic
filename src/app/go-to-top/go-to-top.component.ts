import {ViewportScroller} from '@angular/common';
import {Component, HostListener} from '@angular/core';
import {MatRippleModule} from '@angular/material/core';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-go-to-top',
  templateUrl: './go-to-top.component.html',
  styleUrls: ['./go-to-top.component.scss'],
  standalone: true,
  imports: [FontAwesomeModule, MatRippleModule],
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
