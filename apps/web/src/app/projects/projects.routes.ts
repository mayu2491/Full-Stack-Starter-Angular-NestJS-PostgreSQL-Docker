import { Routes } from '@angular/router';
import { ProjectsListComponent } from './components/projects-list.component';

export const PROJECTS_ROUTES: Routes = [
  {
    path: '',
    component: ProjectsListComponent
  },
  {
    path: 'create',
    loadComponent: () => import('./components/project-form.component').then((m) => m.ProjectFormComponent),
    data: { mode: 'create' }
  },
  {
    path: ':id',
    loadComponent: () => import('./components/project-form.component').then((m) => m.ProjectFormComponent),
    data: { mode: 'edit' }
  }
];
