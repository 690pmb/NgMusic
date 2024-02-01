import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'upperFirst',
  standalone: true,
  pure: true,
})
export class UpperFirstPipe implements PipeTransform {
  transform(value: string): string {
    return value.length === 0 ? '' : value[0]?.toUpperCase() + value.slice(1);
  }
}
