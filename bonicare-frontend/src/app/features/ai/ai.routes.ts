import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const AI_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./ai-reports.component').then((m) => m.AiReportsComponent),
  },
];
