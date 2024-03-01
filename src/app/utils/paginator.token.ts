import {InjectionToken} from '@angular/core';
import {PaginatorService} from '@services/paginator.service';

export const PAGINATOR = new InjectionToken<PaginatorService>('paginator');
