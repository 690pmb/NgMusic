import {Component, Input} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Dropdown} from '@utils/model';
import {MatOptionModule} from '@angular/material/core';
import {NgIf, NgFor} from '@angular/common';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';

@Component({
  selector: 'app-filter-select',
  templateUrl: './filter-select.component.html',
  styleUrls: ['./filter-select.component.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    MatOptionModule,
    NgFor,
  ],
})
export class FilterSelectComponent {
  @Input({required: true})
  placeholder!: string;

  @Input({required: true})
  options!: Dropdown[];

  @Input()
  multiple = false;

  @Input({required: true})
  control!: FormControl<string[] | string>;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  trackByFn(_index: number, option: Dropdown): string {
    return option.code;
  }
}
