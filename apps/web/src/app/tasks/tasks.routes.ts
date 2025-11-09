import { Routes } from '@angular/router';
import { TasksListComponent } from './components/tasks-list.component';

export const TASKS_ROUTES: Routes = [
  {
    path: '',
    component: TasksListComponent
  },
  {
    path: 'create',
    loadComponent: () => import('./components/task-form.component').then((m) => m.TaskFormComponent),
    data: { mode: 'create' }
  },
  {
    path: ':id',
    loadComponent: () => import('./components/task-form.component').then((m) => m.TaskFormComponent),
    data: { mode: 'edit' }
  }
];
