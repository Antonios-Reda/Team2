import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const VIDEO_ROUTES: Routes = [
  {
    path: '',
    canActivate: [roleGuard('patient', 'doctor')],
    loadComponent: () =>
      import('./video-consultation.component').then((m) => m.VideoConsultationComponent),
  },
];
