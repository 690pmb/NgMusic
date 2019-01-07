import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginatorModule } from '@angular/material/paginator';

import { AppComponent } from './app.component';
import { ListComponent } from './list/list.component';


@NgModule({
   declarations: [
      AppComponent,
      ListComponent
   ],
   imports: [
      BrowserAnimationsModule,
      BrowserModule,
      HttpClientModule,
      HttpClientJsonpModule,
      MatTableModule,
      MatSortModule,
      MatPaginatorModule,
   ],
   providers: [],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }
