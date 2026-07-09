import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { AuthUser } from '../../shared/models/api-response.model';

export const roleGuard = (...roles: AuthUser['role'][]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated()) {
      return router.createUrlTree(['/auth/login']);
    }

    if (auth.hasRole(...roles)) {
      return true;
    }

    return router.createUrlTree([auth.getDashboardRoute()]);
  };
};
