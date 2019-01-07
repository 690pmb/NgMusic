import { DropboxService } from './services/dropbox.service';
import { Component, OnInit } from '@angular/core';

import * as xml2js from 'xml2js';
import { Composition, Fichier } from './utils/model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';
  compoList: Composition[];

  constructor(
    private dropboxService: DropboxService
  ) { }

  ngOnInit() {
    const parser = new xml2js.Parser();
    let t0 = performance.now();

    this.dropboxService.downloadFile('AllMusic.xml').then(file => {
      parser.parseString(file, (err, result) => {
        // parser.parseString(file, { tagNameProcessors: [this.nameToLowerCase] }, (err, result) => {
        console.dir(result);
        console.log('Done');
        this.compoList = [];
        result.ListCompositions.compo.forEach(el => {
          console.log(el);
          const c = new Composition(el.$.A, el.$.T, el.$.type, el.$.del, el.$.mergeable);
          const fileList = [];
          el.file.forEach((elFile: any) => {
            const fichier = new Fichier(elFile.$.author, elFile.$.cat, elFile.$.creation, elFile.$.name,
              elFile.$.publish, elFile.$.rangeB, elFile.$.rangeE, elFile.$.rank, elFile.$.size, elFile.$.sorted);
            fileList.push(fichier);
          });
          c.fileList = fileList;
          this.compoList.push(c);
        });
        console.log('compoList', this.compoList);
        let t1 = performance.now();
        console.log('Call to doSomething took ' + (t1 - t0) + ' milliseconds');
      });
    });
  }

  nameToLowerCase(name: string) {
    return name.toLowerCase();
  }

}
