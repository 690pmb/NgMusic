import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

/** Begin year must be lower than end year */
export const yearsValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const begin = control.get('begin');
  const end = control.get('end');

  return begin?.value &&
    end?.value &&
    !begin.pristine &&
    !end.pristine &&
    !begin.errors &&
    !end.errors &&
    begin.value > end.value
    ? {invalidYears: true}
    : null;
};
