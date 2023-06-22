import {Component} from '@angular/core';
import {FaIconLibrary} from '@fortawesome/angular-fontawesome';
import {faTimesCircle} from '@fortawesome/free-regular-svg-icons';
import {faRotateRight, faAngleUp} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'app';
  tabs = 'c';

  constructor(library: FaIconLibrary) {
    library.addIcons(faAngleUp, faTimesCircle, faRotateRight);
  }
}
