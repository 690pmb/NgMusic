import {Observable, catchError, of, map} from 'rxjs';
import {Injectable} from '@angular/core';
import {
  HttpHeaders,
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import {ToastService} from './toast.service';
import {Composition, GlobalError} from '@utils/model';
import {Clipboard} from '@angular/cdk/clipboard';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';

@Injectable({providedIn: 'root'})
export class UtilsService {
  constructor(
    private http: HttpClient,
    private toast: ToastService,
    private clipboard: Clipboard,
    private breakpointObserver: BreakpointObserver
  ) {}

  static getErrorMessage(error: GlobalError): string {
    let message;
    if (UtilsService.isHttpError(error)) {
      let msg;
      if (error.error?.errors) {
        msg = error.error.errors.join(', ');
      } else if (error.error.response) {
        msg = error.error.response.statusText;
      }
      message = `Status ${error.status}: ${msg}`;
    } else if (error.message) {
      message = error.message;
    } else {
      message = error;
    }
    return message;
  }

  private static isHttpError(error: GlobalError): error is HttpErrorResponse {
    return 'status' in error;
  }

  static encodeQueryUrl(query: string): string {
    return encodeURIComponent(query).replace(
      /[!'()*]/g,
      c => `%${c.charCodeAt(0).toString(16)}`
    );
  }

  getHeaders(): HttpHeaders {
    return new HttpHeaders({'Content-Type': 'application/json'});
  }

  handleError(error: GlobalError): void {
    console.error('handleError', error);
    this.toast.open(UtilsService.getErrorMessage(error));
  }

  handlePromiseError(error: GlobalError): Promise<void> {
    console.error('handlePromiseError', error);
    this.toast.open(UtilsService.getErrorMessage(error));
    return new Promise<void>(resolve => {
      resolve(undefined);
    });
  }

  getPromise<T>(url: string, headers?: HttpHeaders): Promise<T> {
    return this.getObservable<T>(url, headers).toPromise();
  }

  getObservable<T>(url: string, headers?: HttpHeaders): Observable<T> {
    return headers
      ? this.http.get<T>(url, {headers: headers})
      : this.http.get<T>(url);
  }

  compositionInClipBoard(composition: Composition): void {
    this.clipboard.copy(`${composition.artist} - ${composition.title}`);
    this.toast.open('Copié !');
  }

  isDesktop(): Observable<boolean> {
    return this.breakpointObserver
      .observe([Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
      .pipe(map(b => b.matches));
  }

  wikisearch(term: string): Observable<string> {
    const params = new HttpParams()
      .set('action', 'opensearch')
      .set('search', term)
      .set('format', 'json');

    return this.http
      .jsonp<string>(
        `https://en.wikipedia.org/w/api.php?${params.toString()}`,
        'callback'
      )
      .pipe(
        map(response => response[3][0]),
        catchError(err => {
          this.handleError(err);
          return of('');
        })
      );
  }
}
