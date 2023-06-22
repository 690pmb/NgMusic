import {registerLocaleData} from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {MatInputModule} from '@angular/material/input';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatRippleModule} from '@angular/material/core';

import {AppComponent} from './app.component';
import {ListCompositionComponent} from './list-composition/list-composition.component';
import {ListFichierComponent} from './list-fichier/list-fichier.component';
import {TitlePipe} from '@utils/title.pipe';
import {FilterInputComponent} from './filter-input/filter-input.component';
import {FilterSelectComponent} from './filter-select/filter-select.component';
import {FilterYearComponent} from './filter-year/filter-year.component';
import {GoToTopComponent} from './go-to-top/go-to-top.component';

@NgModule({
  declarations: [
    AppComponent,
    ListCompositionComponent,
    ListFichierComponent,
    TitlePipe,
    FilterInputComponent,
    FilterSelectComponent,
    FilterYearComponent,
    GoToTopComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    FontAwesomeModule,
    MatSnackBarModule,
    MatTableModule,
    MatRippleModule,
    MatInputModule,
    MatFormFieldModule,
    MatSortModule,
    MatSelectModule,
    MatButtonModule,
    MatPaginatorModule,
    MatCheckboxModule,
    ReactiveFormsModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor() {
    registerLocaleData(localeFr);
  }
}
