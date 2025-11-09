import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const authGuard = (): CanActivateFn => {
  return (route) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const allowedRoles: string[] = route.data?.['roles'] ?? [];

    if (!auth.isAuthenticated() && !allowedRoles.includes('guest')) {
      return router.createUrlTree(['/auth/login']);
    }

    if (allowedRoles.length && auth.currentUser()) {
      const userRole = auth.currentUser()!.role;
      if (!allowedRoles.includes(userRole)) {
        return router.createUrlTree(['/dashboard']);
      }
    }

    return true;
  };
};
