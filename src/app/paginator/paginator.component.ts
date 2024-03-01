import {AsyncPipe, NgIf} from '@angular/common';
import {Component, EventEmitter, Output, inject} from '@angular/core';
import {MatPaginatorModule} from '@angular/material/paginator';
import {PaginatorService} from '@services/paginator.service';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss'],
  standalone: true,
  imports: [MatPaginatorModule, NgIf, AsyncPipe],
})
export class PaginatorComponent {
  @Output()
  changed = new EventEmitter<void>();

  paginatorService = inject(PaginatorService);

  protected pageSizeOptions = [25, 50, 100, 200];
}
