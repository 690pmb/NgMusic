import {AsyncPipe} from '@angular/common';
import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  SkipSelf,
} from '@angular/core';
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {PaginatorService} from '@services/paginator.service';
import {PAGINATOR} from '@utils/paginator.token';
import {map} from 'rxjs';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss'],
  standalone: true,
  imports: [MatPaginatorModule, AsyncPipe],
})
export class PaginatorComponent implements OnInit {
  @Input()
  id?: string;

  @Output()
  changed = new EventEmitter<void>();

  protected paginatorService!: PaginatorService;
  protected pageSizeOptions = [25, 50, 100, 200];

  constructor(
    @SkipSelf()
    @Inject(PAGINATOR)
    private ps: PaginatorService | PaginatorService[],
  ) {}

  ngOnInit(): void {
    if (Array.isArray(this.ps)) {
      this.paginatorService =
        this.ps.find(p => p.id === this.id) ?? new PaginatorService('');
    } else {
      this.paginatorService = this.ps;
    }
  }

  onPage(page: PageEvent): void {
    this.paginatorService.page
      .pipe(
        map(p => ({
          ...page,
          ...{
            pageIndex: page.pageSize !== p.pageSize ? 0 : page.pageIndex,
          },
        })),
      )
      .subscribe(p => this.paginatorService.page$.set(p));
    this.changed.emit();
  }
}
