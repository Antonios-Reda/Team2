import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const PAYMENT_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./payments.component').then((m) => m.PaymentsComponent),
  },
];
