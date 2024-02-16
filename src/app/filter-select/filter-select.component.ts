import {Component, Input} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Dropdown} from '@utils/model';

@Component({
  selector: 'app-filter-select',
  templateUrl: './filter-select.component.html',
  styleUrls: ['./filter-select.component.scss'],
})
export class FilterSelectComponent {
  @Input()
  placeholder!: string;

  @Input()
  options!: Dropdown[];

  @Input()
  multiple = false;

  @Input()
  control!: FormControl<string[] | string>;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  trackByFn(_index: number, option: Dropdown): string {
    return option.code;
  }
}
