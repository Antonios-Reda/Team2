import { Component } from '@angular/core';
import { CardComponent } from '../../shared/ui/card/card.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';

@Component({
  selector: 'bc-admin-dashboard',
  standalone: true,
  imports: [CardComponent, BadgeComponent],
  template: `
    <div class="admin">
      <h2>Admin Dashboard</h2>

      <div class="alert">
        <bc-badge label="Backend API Missing" variant="danger" />
        <p>
          Admin endpoints are not yet implemented on the backend. The following features require
          backend approval and implementation before they can be integrated:
        </p>
        <ul>
          <li>User management (GET /admin/users)</li>
          <li>Doctor approval workflow (PUT /admin/doctors/:id/approve)</li>
          <li>Platform analytics (GET /admin/analytics)</li>
          <li>Payment oversight dashboard</li>
          <li>System monitoring</li>
        </ul>
        <p>See <code>docs/BACKEND_REVIEW_REPORT.md</code> for the full gap analysis.</p>
      </div>

      <div class="admin__grid">
        <bc-card title="Users">
          <div class="placeholder-stat">—</div>
          <p class="muted">Pending API</p>
        </bc-card>
        <bc-card title="Pending Doctors">
          <div class="placeholder-stat">—</div>
          <p class="muted">Pending API</p>
        </bc-card>
        <bc-card title="Total Appointments">
          <div class="placeholder-stat">—</div>
          <p class="muted">Pending API</p>
        </bc-card>
        <bc-card title="Revenue">
          <div class="placeholder-stat">—</div>
          <p class="muted">Pending API</p>
        </bc-card>
      </div>
    </div>
  `,
  styles: [`
    .admin {
      h2 { margin-bottom: 1.5rem; }
      &__grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.25rem;
      }
    }
    .alert {
      padding: 1.25rem;
      background: #fee2e2;
      border: 1px solid #fca5a5;
      border-radius: var(--radius-lg);
      margin-bottom: 2rem;
      bc-badge { margin-bottom: 0.75rem; display: inline-flex; }
      p, li { font-size: 0.875rem; color: #991b1b; }
      ul { margin: 0.75rem 0; padding-left: 1.5rem; }
      code { font-size: 0.8125rem; }
    }
    .placeholder-stat {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--color-text-muted);
    }
    .muted { font-size: 0.8125rem; color: var(--color-text-muted); }
  `],
})
export class AdminDashboardComponent {}
