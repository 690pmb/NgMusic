import {catchError, filter, map, take} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Clipboard} from '@angular/cdk/clipboard';
import {Injectable} from '@angular/core';
import {Composition} from '@utils/model';
import {UtilsService} from './utils.service';
import {ToastService} from './toast.service';
import {Reactive} from '@utils/reactive';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private composition?: Composition;
  public wiki = new Reactive<string>();

  constructor(
    protected utilsService: UtilsService,
    private http: HttpClient,
    private clipboard: Clipboard,
    private toast: ToastService,
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
        'callback',
      )
      .pipe(
        map(response => response[3]?.[0]),
        filter((url): url is string => !!url),
        catchError(err =>
          this.utilsService.handleError(
            err,
            'Error when searching wikipedia url',
          ),
        ),
      )
      .subscribe(u => this.wiki.set(u));
  }

  openWiki(): void {
    this.wiki.obs$.pipe(take(1)).subscribe(w => window.open(w));
  }

  openGoogle(): void {
    window.open(
      `https://www.google.com/search?q=${this.composition?.artist}%20${this.composition?.title}`,
    );
  }

  compositionInClipBoard(composition?: Composition): void {
    const c = composition ?? this.composition;
    this.clipboard.copy(`${c?.artist} - ${c?.title}`);
    this.toast.open('Copié !');
  }
}
