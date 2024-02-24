import {Component, OnInit} from '@angular/core';
import {NavigationService} from './services/navigation.service';
import {ListFichierComponent} from './list-fichier/list-fichier.component';
import {ListCompositionComponent} from './list-composition/list-composition.component';
import {NgIf, NgClass, AsyncPipe, registerLocaleData} from '@angular/common';
import {FaIconLibrary} from '@fortawesome/angular-fontawesome';
import {faCopy, faTimesCircle} from '@fortawesome/free-regular-svg-icons';
import {faGoogle, faWikipediaW} from '@fortawesome/free-brands-svg-icons';
import localeFr from '@angular/common/locales/fr';
import {
  faRotateRight,
  faAngleUp,
  faEllipsisVertical,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    ListCompositionComponent,
    ListFichierComponent,
    AsyncPipe,
  ],
})
export class AppComponent implements OnInit {
  constructor(
    protected navigationService: NavigationService,
    library: FaIconLibrary
  ) {
    registerLocaleData(localeFr);
    library.addIcons(
      faAngleUp,
      faWikipediaW,
      faCopy,
      faTimesCircle,
      faRotateRight,
      faEllipsisVertical,
      faCheck,
      faGoogle
    );
  }

  ngOnInit(): void {
    this.navigationService.setTab('Composition');
  }
}
