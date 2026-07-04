import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const DOCTOR_ROUTES: Routes = [
  {
    path: '',
    canActivate: [roleGuard('doctor')],
    loadComponent: () =>
      import('./doctor-dashboard/doctor-dashboard.component').then((m) => m.DoctorDashboardComponent),
  },
  {
    path: 'profile',
    canActivate: [roleGuard('doctor')],
    loadComponent: () =>
      import('./doctor-dashboard/doctor-dashboard.component').then((m) => m.DoctorDashboardComponent),
  },
  {
    path: 'availability',
    canActivate: [roleGuard('doctor')],
    loadComponent: () =>
      import('./doctor-availability/doctor-availability.component').then((m) => m.DoctorAvailabilityComponent),
  },
];
