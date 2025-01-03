import {Dexie, BulkError} from 'dexie';
import {Observable, from} from 'rxjs';

export class Table<T> {
  private dexie: Dexie.Table<T, number>;

  constructor(dexie: Dexie.Table<T, number>) {
    this.dexie = dexie;
  }

  getAll(): Observable<T[]> {
    return from(this.dexie.toArray());
  }

  add(data: T): Observable<number> {
    return from(this.dexie.add(data));
  }

  get(key: number): Observable<T | undefined> {
    return from(this.dexie.get(key));
  }

  update(key: number, changes: Record<string, string>): Observable<number> {
    return from(this.dexie.update(key, changes));
  }

  clear(): Observable<void> {
    return from(this.dexie.clear());
  }

  addAll(data: T[]): Observable<void> {
    return from(
      this.dexie
        .bulkAdd(data)
        .then(() => console.warn(`Done adding ${data.length} datas`))
        .catch(Dexie.BulkError, (e: BulkError) => {
          // Explicitely catching the bulkAdd() operation makes those successful
          // additions commit despite that there were errors.
          console.error(
            `Some items did not succeed. However, ${
              data.length - e.failures.length
            } items was added successfully`,
          );
        }),
    );
  }
}
