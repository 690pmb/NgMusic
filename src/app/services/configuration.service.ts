import {Injectable} from '@angular/core';
import {from, Observable, of} from 'rxjs';
import {tap} from 'rxjs/operators';

export type Configuration = Record<'token', string>;

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService {
  configuration!: Configuration;

  load(): Observable<Configuration> {
    return this.configuration
      ? of(this.configuration)
      : from(fetch('./assets/configuration.json').then(res => res.json())).pipe(
          tap((configuration: Configuration) => {
            this.configuration = configuration;
          })
        );
  }

  get(): Configuration {
    if (this.configuration) {
      return this.configuration;
    } else {
      throw new Error('Configuration is not loaded');
    }
  }
}
