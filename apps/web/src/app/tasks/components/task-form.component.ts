import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { map, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TasksService } from '../services/tasks.service';
import { ProjectsService } from '../../projects/services/projects.service';

@Component({
  standalone: true,
  selector: 'app-task-form',
  imports: [ReactiveFormsModule, NgIf, AsyncPipe],
  template: `
    <section class="card" *ngIf="mode as mode">
      <h2>{{ mode === 'create' ? 'Create task' : 'Update task' }}</h2>
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <label>
          Title
          <input formControlName="title" />
        </label>
        <label>
          Description
          <textarea rows="3" formControlName="description"></textarea>
        </label>
        <label>
          Status
          <select formControlName="status">
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
          </select>
        </label>
        <label>
          Project
          <select formControlName="projectId">
            <option *ngFor="let project of projectsOptions | async" [value]="project.id">
              {{ project.name }}
            </option>
          </select>
        </label>
        <label>
          Due date
          <input type="date" formControlName="dueDate" />
        </label>
        <div class="form-grid">
          <button type="submit" [disabled]="form.invalid">Save</button>
          <button type="button" class="secondary" (click)="cancel()">Cancel</button>
        </div>
      </form>
      <button *ngIf="mode === 'edit'" class="secondary" (click)="remove()">Delete task</button>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private tasks = inject(TasksService);
  private projects = inject(ProjectsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    status: ['todo', Validators.required],
    projectId: ['', Validators.required],
    dueDate: ['']
  });

  readonly projectsOptions = this.projects
    .list({ page: 1, pageSize: 100 })
    .pipe(
      map((res) => res.data),
      tap((projects) => {
        if (!this.form.controls.projectId.value && projects.length) {
          this.form.controls.projectId.setValue(projects[0].id);
        }
      })
    );

  mode: 'create' | 'edit' = 'create';
  private taskId: string | null = null;

  ngOnInit(): void {
    this.mode = (this.route.snapshot.data?.['mode'] ?? (this.route.snapshot.paramMap.has('id') ? 'edit' : 'create')) as
      | 'create'
      | 'edit';

    if (this.mode === 'edit') {
      this.route.paramMap
        .pipe(
          switchMap((params) => this.tasks.findOne(params.get('id')!)),
          tap((task) => {
            this.taskId = task.id;
            this.form.patchValue({
              title: task.title,
              description: task.description ?? '',
              status: task.status,
              projectId: task.projectId,
              dueDate: task.dueDate ? task.dueDate.substring(0, 10) : ''
            });
          }),
          takeUntilDestroyed()
        )
        .subscribe();
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue();

    const request = this.mode === 'create'
      ? this.tasks.create(payload)
      : this.tasks.update(this.taskId!, payload);

    request.pipe(takeUntilDestroyed()).subscribe(() => this.router.navigate(['/tasks']));
  }

  cancel(): void {
    this.router.navigate(['/tasks']);
  }

  remove(): void {
    if (!this.taskId) {
      return;
    }

    this.tasks.remove(this.taskId).pipe(takeUntilDestroyed()).subscribe(() => this.router.navigate(['/tasks']));
  }
}
