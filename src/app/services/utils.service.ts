import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {HttpHeaders, HttpClient, HttpErrorResponse} from '@angular/common/http';
import {ToastService} from './toast.service';
import {GlobalError} from '../utils/model';

@Injectable({providedIn: 'root'})
export class UtilsService {
  constructor(private http: HttpClient, private toast: ToastService) {}

  static getErrorMessage(error: GlobalError): string {
    let message;
    if (UtilsService.isHttpError(error)) {
      message = `Status ${error.status}: ${error.error.errors.join(', ')}`;
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
}
