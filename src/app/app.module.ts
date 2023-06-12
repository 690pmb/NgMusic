import {registerLocaleData} from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacyTableModule as MatTableModule} from '@angular/material/legacy-table';
import {MatSortModule} from '@angular/material/sort';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyCheckboxModule as MatCheckboxModule} from '@angular/material/legacy-checkbox';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {MatLegacyPaginatorModule as MatPaginatorModule} from '@angular/material/legacy-paginator';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {MatLegacySnackBarModule as MatSnackBarModule} from '@angular/material/legacy-snack-bar';

import {AppComponent} from './app.component';
import {ListCompositionComponent} from './list-composition/list-composition.component';
import {ListFichierComponent} from './list-fichier/list-fichier.component';
import {TitlePipe} from './utils/title.pipe';

@NgModule({
  declarations: [
    AppComponent,
    ListCompositionComponent,
    ListFichierComponent,
    TitlePipe,
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    FontAwesomeModule,
    MatSnackBarModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatSortModule,
    MatSelectModule,
    MatButtonModule,
    MatPaginatorModule,
    MatCheckboxModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor() {
    registerLocaleData(localeFr);
  }
}
