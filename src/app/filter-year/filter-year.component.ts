import {Component, Input} from '@angular/core';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-filter-year',
  templateUrl: './filter-year.component.html',
  styleUrls: ['./filter-year.component.scss'],
})
export class FilterYearComponent {
  @Input()
  placeholder?: string;

  @Input()
  control!: FormControl<number>;
}
