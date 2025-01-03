import {
  enableProdMode,
  isDevMode,
  importProvidersFrom,
  APP_INITIALIZER,
} from '@angular/core';
import {environment} from './environments/environment';
import {AppComponent} from './app/app.component';
import {ServiceWorkerModule} from '@angular/service-worker';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatSelectModule} from '@angular/material/select';
import {MatRippleModule} from '@angular/material/core';
import {
  MatPaginatorIntl,
  MatPaginatorModule,
} from '@angular/material/paginator';
import {MatMenuModule} from '@angular/material/menu';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDialogModule} from '@angular/material/dialog';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatButtonModule} from '@angular/material/button';
import {LayoutModule} from '@angular/cdk/layout';
import {
  HttpClientJsonpModule,
  withInterceptorsFromDi,
  provideHttpClient,
} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {ClipboardModule} from '@angular/cdk/clipboard';
import {BrowserModule, bootstrapApplication} from '@angular/platform-browser';
import {provideAnimations} from '@angular/platform-browser/animations';
import {
  Configuration,
  ConfigurationService,
} from '@services/configuration.service';
import {Observable} from 'rxjs';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      ClipboardModule,
      FontAwesomeModule,
      FormsModule,
      HttpClientJsonpModule,
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
      ServiceWorkerModule.register('ngsw-worker.js', {
        enabled: !isDevMode(),
        // Register the ServiceWorker as soon as the application is stable
        // or after 30 seconds (whichever comes first).
        registrationStrategy: 'registerWhenStable:30000',
      }),
    ),
    {
      provide: MatPaginatorIntl,
      useFactory: (): MatPaginatorIntl => {
        const int = new MatPaginatorIntl();
        int.itemsPerPageLabel = 'Élements par page';
        int.nextPageLabel = 'Page suivante';
        int.previousPageLabel = 'Page précédente';
        int.firstPageLabel = '1ère page';
        int.lastPageLabel = 'Dernière page';
        const e = int.getRangeLabel;
        int.getRangeLabel = (page: number, pageSize: number, length: number) =>
          e(page, pageSize, length).replace('of', 'sur');
        return int;
      },
    },
    {
      provide: APP_INITIALIZER,
      useFactory:
        (conf: ConfigurationService): (() => Observable<Configuration>) =>
        () =>
          conf.load(),
      deps: [ConfigurationService],
      multi: true,
    },
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
  ],
}).catch(err => console.error(err));
