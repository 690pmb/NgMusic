import {catchError, of, map, ReplaySubject, take} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Clipboard} from '@angular/cdk/clipboard';
import {Injectable} from '@angular/core';
import {Composition} from '@utils/model';
import {UtilsService} from './utils.service';
import {ToastService} from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private composition?: Composition;
  private wiki$ = new ReplaySubject<string>(1);
  wiki = this.wiki$.asObservable();

  constructor(
    protected utilsService: UtilsService,
    private http: HttpClient,
    private clipboard: Clipboard,
    private toast: ToastService
  ) {}

  getWikiUrl(composition: Composition): void {
    this.composition = composition;
    const params = new HttpParams()
      .set('action', 'opensearch')
      .set('search', this.composition.title)
      .set('format', 'json');

    this.http
      .jsonp<string>(
        `https://en.wikipedia.org/w/api.php?${params.toString()}`,
        'callback'
      )
      .pipe(
        map(response => response[3][0]),
        catchError(err => {
          this.utilsService.handleError(err);
          return of('');
        })
      )
      .subscribe(u => this.setWiki(u));
  }

  setWiki(w: string): void {
    this.wiki$.next(w);
  }

  openWiki(): void {
    this.wiki.pipe(take(1)).subscribe(w => window.open(w));
  }

  openGoogle(): void {
    window.open(
      `https://www.google.com/search?q=${this.composition?.artist}%20${this.composition?.title}`
    );
  }

  compositionInClipBoard(composition?: Composition): void {
    const c = composition ?? this.composition;
    this.clipboard.copy(`${c?.artist} - ${c?.title}`);
    this.toast.open('Copié !');
  }
}
