import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const APPOINTMENT_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./appointments.component').then((m) => m.AppointmentsComponent),
  },
];
