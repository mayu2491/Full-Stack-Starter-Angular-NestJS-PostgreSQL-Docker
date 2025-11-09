import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, combineLatest, map, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProjectsService } from '../services/projects.service';

@Component({
  standalone: true,
  selector: 'app-projects-list',
  imports: [AsyncPipe, NgIf, NgFor, ReactiveFormsModule, RouterLink],
  template: `
    <section class="card">
      <div class="form-grid" [formGroup]="filtersForm">
        <input type="search" placeholder="Search" formControlName="search" />
        <select formControlName="status">
          <option value="">All statuses</option>
          <option value="planned">Planned</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
        <button type="button" (click)="applyFilters()">Apply</button>
      </div>
      <div class="table-wrapper" *ngIf="vm$ | async as vm">
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let project of vm.projects.data">
              <td><a [routerLink]="['/projects', project.id]">{{ project.name }}</a></td>
              <td>{{ project.status }}</td>
              <td>{{ project.ownerId }}</td>
            </tr>
          </tbody>
        </table>
        <div class="pagination">
          <button class="secondary" (click)="prevPage()" [disabled]="vm.filters.page === 1">Prev</button>
          <span>Page {{ vm.filters.page }} of {{ vm.totalPages }}</span>
          <button class="secondary" (click)="nextPage(vm.totalPages)" [disabled]="vm.filters.page === vm.totalPages">Next</button>
        </div>
        <a routerLink="/projects/create">Create project</a>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectsListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private projects = inject(ProjectsService);

  readonly filtersForm = this.fb.nonNullable.group({
    search: [''],
    status: ['']
  });

  private readonly pagination$ = new BehaviorSubject({ page: 1, pageSize: 10 });
  private readonly filters$ = new BehaviorSubject<{ search?: string; status?: string }>({});

  readonly vm$ = combineLatest([this.pagination$, this.filters$]).pipe(
    switchMap(([pagination, filters]) =>
      this.projects.list({ ...pagination, ...filters }).pipe(
        map((projects) => ({
          projects,
          filters: pagination,
          totalPages: Math.max(1, Math.ceil(projects.total / pagination.pageSize))
        }))
      )
    )
  );

  ngOnInit(): void {
    this.filtersForm.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      this.filters$.next({
        search: value.search ?? undefined,
        status: value.status ?? undefined
      });
    });
  }

  applyFilters(): void {
    this.filters$.next({
      search: this.filtersForm.value.search ?? undefined,
      status: this.filtersForm.value.status ?? undefined
    });
    this.pagination$.next({ ...this.pagination$.value, page: 1 });
  }

  prevPage(): void {
    const current = this.pagination$.value.page;
    if (current > 1) {
      this.pagination$.next({ ...this.pagination$.value, page: current - 1 });
    }
  }

  nextPage(total: number): void {
    const current = this.pagination$.value.page;
    if (current < total) {
      this.pagination$.next({ ...this.pagination$.value, page: current + 1 });
    }
  }
}
