import {
  Observable,
  map,
  distinctUntilChanged,
  debounceTime,
  throwError,
} from 'rxjs';
import {Injectable} from '@angular/core';
import {HttpHeaders, HttpClient, HttpErrorResponse} from '@angular/common/http';
import {ToastService} from './toast.service';
import {GlobalError} from '@utils/model';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';

@Injectable({providedIn: 'root'})
export class UtilsService {
  constructor(
    private http: HttpClient,
    private toast: ToastService,
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
    } else if (UtilsService.isError(error)) {
      message = error.message;
    } else {
      message = error;
    }
    return message;
  }

  private static isHttpError(error: GlobalError): error is HttpErrorResponse {
    return (error as HttpErrorResponse).status !== undefined;
  }

  private static isError(error: GlobalError): error is Error {
    return (error as Error).message !== undefined;
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

  handleError(error: GlobalError, message: string): Observable<never> {
    console.error('handleError', error);
    this.toast.open(UtilsService.getErrorMessage(error));
    return throwError(() => message);
  }

  getObservable<T>(url: string, headers?: HttpHeaders): Observable<T> {
    return headers
      ? this.http.get<T>(url, {headers: headers})
      : this.http.get<T>(url);
  }

  isDesktop(): Observable<boolean> {
    return this.breakpointObserver
      .observe([Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
      .pipe(
        debounceTime(200),
        map(b => b.matches),
        distinctUntilChanged()
      );
  }
}
