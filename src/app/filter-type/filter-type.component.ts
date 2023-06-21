import {Component, Input} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Dropdown} from '@utils/model';

@Component({
  selector: 'app-filter-type',
  templateUrl: './filter-type.component.html',
  styleUrls: ['./filter-type.component.scss'],
})
export class FilterTypeComponent {
  @Input()
  control!: FormControl<string>;

  readonly types = [
    new Dropdown('Chanson', 'SONG'),
    new Dropdown('Album', 'ALBUM'),
  ];
}
