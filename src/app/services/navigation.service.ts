import {ViewportScroller} from '@angular/common';
import {Injectable, inject} from '@angular/core';
import {Composition, Fichier} from '@utils/model';
import {Reactive} from '@utils/reactive';

export type Tab = 'Composition' | 'Fichier';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  public tab = new Reactive<Tab>();
  public composition = new Reactive<Partial<Composition>>();
  public fichier = new Reactive<Fichier>();
  private scroll = inject(ViewportScroller);

  setTab(tab: Tab): void {
    this.tab.set(tab);
    this.scroll.scrollToPosition([0, 0]);
  }
}
