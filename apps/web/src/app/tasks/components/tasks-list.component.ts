import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, combineLatest, map, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TasksService } from '../services/tasks.service';
import { ProjectsService } from '../../projects/services/projects.service';

@Component({
  standalone: true,
  selector: 'app-tasks-list',
  imports: [AsyncPipe, NgIf, NgFor, ReactiveFormsModule, RouterLink],
  template: `
    <section class="card">
      <div class="form-grid" [formGroup]="filtersForm">
        <input type="search" placeholder="Search" formControlName="search" />
        <select formControlName="status">
          <option value="">All statuses</option>
          <option value="todo">To do</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>
        <select formControlName="projectId">
          <option value="">All projects</option>
          <option *ngFor="let project of projectsOptions$ | async" [value]="project.id">
            {{ project.name }}
          </option>
        </select>
        <button type="button" (click)="applyFilters()">Apply</button>
      </div>
      <div class="table-wrapper" *ngIf="vm$ | async as vm">
        <table class="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Project</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let task of vm.tasks.data">
              <td><a [routerLink]="['/tasks', task.id]">{{ task.title }}</a></td>
              <td>{{ task.status }}</td>
              <td>{{ task.projectId }}</td>
            </tr>
          </tbody>
        </table>
        <div class="pagination">
          <button class="secondary" (click)="prevPage()" [disabled]="vm.filters.page === 1">Prev</button>
          <span>Page {{ vm.filters.page }} of {{ vm.totalPages }}</span>
          <button class="secondary" (click)="nextPage(vm.totalPages)" [disabled]="vm.filters.page === vm.totalPages">Next</button>
        </div>
        <a routerLink="/tasks/create">Create task</a>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TasksListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private tasks = inject(TasksService);
  private projects = inject(ProjectsService);

  readonly filtersForm = this.fb.nonNullable.group({
    search: [''],
    status: [''],
    projectId: ['']
  });

  private readonly pagination$ = new BehaviorSubject({ page: 1, pageSize: 10 });
  private readonly filters$ = new BehaviorSubject<{ search?: string; status?: string; projectId?: string }>({});

  readonly vm$ = combineLatest([this.pagination$, this.filters$]).pipe(
    switchMap(([pagination, filters]) =>
      this.tasks.list({ ...pagination, ...filters }).pipe(
        map((tasks) => ({
          tasks,
          filters: pagination,
          totalPages: Math.max(1, Math.ceil(tasks.total / pagination.pageSize))
        }))
      )
    )
  );

  readonly projectsOptions$ = this.projects.list({ page: 1, pageSize: 100 }).pipe(map((res) => res.data));

  ngOnInit(): void {
    this.filtersForm.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      this.filters$.next({
        search: value.search ?? undefined,
        status: value.status ?? undefined,
        projectId: value.projectId ?? undefined
      });
    });
  }

  applyFilters(): void {
    this.filters$.next({
      search: this.filtersForm.value.search ?? undefined,
      status: this.filtersForm.value.status ?? undefined,
      projectId: this.filtersForm.value.projectId ?? undefined
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
