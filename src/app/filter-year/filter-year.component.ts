import {Component, Input} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';

import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

@Component({
  selector: 'app-filter-year',
  templateUrl: './filter-year.component.html',
  styleUrls: ['./filter-year.component.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class FilterYearComponent {
  @Input({required: true})
  placeholder!: string;

  @Input({required: true})
  control!: FormControl<number | undefined>;
}
