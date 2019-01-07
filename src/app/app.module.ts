import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { ListComponent } from './list/list.component';


@NgModule({
   declarations: [
      AppComponent,
      ListComponent
   ],
   imports: [
      BrowserModule,
      HttpClientModule,
      HttpClientJsonpModule
   ],
   providers: [],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }
