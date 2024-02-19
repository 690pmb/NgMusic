import {registerLocaleData} from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import {BrowserModule} from '@angular/platform-browser';
import {NgModule, isDevMode} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientJsonpModule, HttpClientModule} from '@angular/common/http';
import {MatInputModule} from '@angular/material/input';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatRippleModule} from '@angular/material/core';
import {ClipboardModule} from '@angular/cdk/clipboard';
import {
  FontAwesomeModule,
  FaIconLibrary,
} from '@fortawesome/angular-fontawesome';
import {faCopy, faTimesCircle} from '@fortawesome/free-regular-svg-icons';
import {faGoogle, faWikipediaW} from '@fortawesome/free-brands-svg-icons';
import {
  faRotateRight,
  faAngleUp,
  faEllipsisVertical,
} from '@fortawesome/free-solid-svg-icons';

import {AppComponent} from './app.component';
import {ListCompositionComponent} from './list-composition/list-composition.component';
import {ListFichierComponent} from './list-fichier/list-fichier.component';
import {TitlePipe} from '@pipes/title.pipe';
import {FilterInputComponent} from './filter-input/filter-input.component';
import {FilterSelectComponent} from './filter-select/filter-select.component';
import {FilterYearComponent} from './filter-year/filter-year.component';
import {GoToTopComponent} from './go-to-top/go-to-top.component';
import {RowActionDirective} from './row-action/row-action.directive';
import {LayoutModule} from '@angular/cdk/layout';
import {MatMenuModule} from '@angular/material/menu';
import {RowMenuComponent} from './row-menu/row-menu.component';
import {UpperFirstPipe} from '@pipes/upper-first.pipe';
import {MenuDialogComponent} from './menu-dialog/menu-dialog.component';
import {MenuComponent} from './menu/menu.component';
import {ServiceWorkerModule} from '@angular/service-worker';

@NgModule({
  declarations: [
    AppComponent,
    FilterInputComponent,
    FilterSelectComponent,
    FilterYearComponent,
    GoToTopComponent,
    ListCompositionComponent,
    ListFichierComponent,
    MenuDialogComponent,
    RowActionDirective,
    RowMenuComponent,
    MenuComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    ClipboardModule,
    FontAwesomeModule,
    FormsModule,
    HttpClientJsonpModule,
    HttpClientModule,
    LayoutModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatRippleModule,
    MatSelectModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    ReactiveFormsModule,
    TitlePipe,
    UpperFirstPipe,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    registerLocaleData(localeFr);
    library.addIcons(
      faAngleUp,
      faWikipediaW,
      faCopy,
      faTimesCircle,
      faRotateRight,
      faEllipsisVertical,
      faGoogle
    );
  }
}
