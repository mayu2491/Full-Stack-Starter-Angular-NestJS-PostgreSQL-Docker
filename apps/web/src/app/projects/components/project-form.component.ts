import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProjectsService } from '../services/projects.service';

@Component({
  standalone: true,
  selector: 'app-project-form',
  imports: [ReactiveFormsModule, NgIf],
  template: `
    <section class="card" *ngIf="mode as mode">
      <h2>{{ mode === 'create' ? 'Create project' : 'Update project' }}</h2>
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <label>
          Name
          <input formControlName="name" />
        </label>
        <label>
          Description
          <textarea rows="3" formControlName="description"></textarea>
        </label>
        <label>
          Status
          <select formControlName="status">
            <option value="planned">Planned</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </label>
        <div class="form-grid">
          <button type="submit" [disabled]="form.invalid">Save</button>
          <button type="button" class="secondary" (click)="cancel()">Cancel</button>
        </div>
      </form>
      <button *ngIf="mode === 'edit'" class="secondary" (click)="remove()">Delete project</button>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private projects = inject(ProjectsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    status: ['planned', Validators.required]
  });

  mode: 'create' | 'edit' = 'create';
  private projectId: string | null = null;

  ngOnInit(): void {
    this.mode = (this.route.snapshot.data?.['mode'] ?? (this.route.snapshot.paramMap.has('id') ? 'edit' : 'create')) as
      | 'create'
      | 'edit';

    if (this.mode === 'edit') {
      this.route.paramMap
        .pipe(
          switchMap((params) => this.projects.findOne(params.get('id')!)),
          tap((project) => {
            this.projectId = project.id;
            this.form.patchValue({
              name: project.name,
              description: project.description ?? '',
              status: project.status
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
      ? this.projects.create(payload)
      : this.projects.update(this.projectId!, payload);

    request.pipe(takeUntilDestroyed()).subscribe(() => this.router.navigate(['/projects']));
  }

  cancel(): void {
    this.router.navigate(['/projects']);
  }

  remove(): void {
    if (!this.projectId) {
      return;
    }

    this.projects.remove(this.projectId).pipe(takeUntilDestroyed()).subscribe(() => this.router.navigate(['/projects']));
  }
}
