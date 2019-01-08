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
    this.myCompositionsService.downloadCompostion('final.xml');
  }
}
