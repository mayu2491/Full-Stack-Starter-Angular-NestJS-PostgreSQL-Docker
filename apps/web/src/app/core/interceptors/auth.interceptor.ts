import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.accessToken();

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        const isAuthRoute = authReq.url.includes('/auth/login') || authReq.url.includes('/auth/refresh');
        if (isAuthRoute) {
          auth.logout();
          return throwError(() => error);
        }

        return auth.refresh().pipe(
          switchMap(() => {
            const refreshedToken = auth.accessToken();
            if (!refreshedToken) {
              return throwError(() => error);
            }
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${refreshedToken}`
              }
            });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            auth.logout();
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
