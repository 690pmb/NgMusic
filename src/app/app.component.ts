import { Component, OnInit } from '@angular/core';

import { MyCompositionsService } from './services/my-compositions.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'app';

  constructor(
    private myCompositionsService: MyCompositionsService
  ) { }

  ngOnInit() {
    const session = sessionStorage.getItem('compoList');
    if (session === undefined || session === null || session.trim() === '') {
      this.myCompositionsService.getAll('Fluxblog.xml');
    } else {
      this.myCompositionsService.myCompositions$.next(JSON.parse(sessionStorage.getItem('compoList')));
    }
  }
}
