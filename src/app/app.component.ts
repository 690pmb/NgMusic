import { Component, OnInit } from '@angular/core';

import { CompositionService } from './services/composition.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'app';
  tabs = 'c';

  constructor(
    private myCompositionsService: CompositionService
  ) { }

  ngOnInit(): void {
    this.myCompositionsService.loadsCompositionList();
  }
}
