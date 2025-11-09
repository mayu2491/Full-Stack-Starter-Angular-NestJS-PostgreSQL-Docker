import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { combineLatest, map } from 'rxjs';
import { ProjectsService } from '../projects/services/projects.service';
import { TasksService } from '../tasks/services/tasks.service';
import { AuthService } from '../core/auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [AsyncPipe, NgIf, NgFor, DatePipe],
  template: `
    <div class="grid-two" *ngIf="vm$ | async as vm">
      <section class="card">
        <h3>Welcome back, {{ vm.user?.email ?? 'Guest' }}!</h3>
        <p>Your role is <strong>{{ vm.user?.role ?? 'guest' }}</strong>.</p>
        <p *ngIf="vm.user">You have {{ vm.projects.total }} projects and {{ vm.tasks.total }} tasks.</p>
        <p *ngIf="!vm.user">Sign in to manage projects and tasks.</p>
      </section>
      <section class="card">
        <h3>Recent Projects</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let project of vm.projects.data">
              <td>{{ project.name }}</td>
              <td>{{ project.status }}</td>
              <td>{{ project.updatedAt | date: 'short' }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  private projects = inject(ProjectsService);
  private tasks = inject(TasksService);
  private auth = inject(AuthService);

  readonly vm$ = combineLatest([
    this.projects.list({ page: 1, pageSize: 5 }),
    this.tasks.list({ page: 1, pageSize: 5 })
  ]).pipe(
    map(([projects, tasks]) => ({
      projects,
      tasks,
      user: this.auth.currentUser()
    }))
  );
}
