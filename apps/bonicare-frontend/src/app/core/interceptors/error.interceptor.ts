import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { parseApiError } from '../../shared/utils/http-error.util';

const AUTH_URLS = ['/auth/login', '/auth/signup'];

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const toast = inject(ToastService);
  const isAuthRequest = AUTH_URLS.some((path) => req.url.includes(path));

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const parsed = parseApiError(error);

      if (!isAuthRequest) {
        if (error.status === 401) {
          toast.error(parsed.message || 'Your session has expired. Please sign in again.');
          auth.logout();
        } else {
          toast.error(parsed.message);
        }
      }

      return throwError(() => error);
    })
  );
};
