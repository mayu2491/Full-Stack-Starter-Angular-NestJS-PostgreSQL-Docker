import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const APP_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./core/auth/login.component').then((m) => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./core/auth/register.component').then((m) => m.RegisterComponent)
      }
    ]
  },
  {
    path: 'dashboard',
    canActivate: [authGuard()],
    data: { roles: ['guest', 'member', 'admin'] },
    loadComponent: () => import('./layout/dashboard.component').then((m) => m.DashboardComponent)
  },
  {
    path: 'projects',
    canActivate: [authGuard()],
    data: { roles: ['member', 'admin'] },
    loadChildren: () =>
      import('./projects/projects.routes').then((m) => m.PROJECTS_ROUTES)
  },
  {
    path: 'tasks',
    canActivate: [authGuard()],
    data: { roles: ['admin'] },
    loadChildren: () => import('./tasks/tasks.routes').then((m) => m.TASKS_ROUTES)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
