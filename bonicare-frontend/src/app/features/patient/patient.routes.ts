import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const PATIENT_ROUTES: Routes = [
  {
    path: '',
    canActivate: [roleGuard('patient')],
    loadComponent: () =>
      import('./patient-dashboard/patient-dashboard.component').then((m) => m.PatientDashboardComponent),
  },
];
