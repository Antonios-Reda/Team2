import { Component, input } from '@angular/core';

@Component({
  selector: 'bc-badge',
  standalone: true,
  template: `<span class="bc-badge bc-badge--{{ variant() }}">{{ label() }}</span>`,
  styles: [`
    .bc-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.125rem 0.625rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: capitalize;
    }
    .bc-badge--default { background: var(--color-surface-hover); color: var(--color-text-muted); }
    .bc-badge--primary { background: var(--color-primary-light); color: var(--color-primary); }
    .bc-badge--success { background: #dcfce7; color: #166534; }
    .bc-badge--warning { background: #fef3c7; color: #92400e; }
    .bc-badge--danger { background: #fee2e2; color: #991b1b; }
    [data-theme="dark"] .bc-badge--success { background: #14532d; color: #86efac; }
    [data-theme="dark"] .bc-badge--warning { background: #78350f; color: #fcd34d; }
    [data-theme="dark"] .bc-badge--danger { background: #7f1d1d; color: #fca5a5; }
  `],
})
export class BadgeComponent {
  readonly label = input.required<string>();
  readonly variant = input<'default' | 'primary' | 'success' | 'warning' | 'danger'>('default');
}
