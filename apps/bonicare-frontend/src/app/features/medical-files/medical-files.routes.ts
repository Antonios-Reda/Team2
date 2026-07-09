import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const MEDICAL_FILES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [roleGuard('patient')],
    loadComponent: () =>
      import('./medical-files.component').then((m) => m.MedicalFilesComponent),
  },
];
