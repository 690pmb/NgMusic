import {ReplaySubject} from 'rxjs';

export class Reactive<T> {
  private current$ = new ReplaySubject<T>(1);
  public obs$ = this.current$.asObservable();

  set(item: T): void {
    this.current$.next(item);
  }
}
