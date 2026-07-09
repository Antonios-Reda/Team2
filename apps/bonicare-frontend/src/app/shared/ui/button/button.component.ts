import { Component, input, output } from '@angular/core';

@Component({
  selector: 'bc-button',
  standalone: true,
  template: `
    <button
      [type]="type()"
      [class]="'bc-btn bc-btn--' + variant() + ' bc-btn--' + size()"
      [disabled]="disabled() || loading()"
      [attr.aria-busy]="loading()"
      (click)="clicked.emit($event)"
    >
      @if (loading()) {
        <span class="bc-btn__spinner" aria-hidden="true"></span>
      }
      <ng-content />
    </button>
  `,
  styles: [`
    .bc-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-weight: 600;
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: inherit;
    }
    .bc-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .bc-btn--sm { padding: 0.375rem 0.75rem; font-size: 0.8125rem; }
    .bc-btn--md { padding: 0.625rem 1.25rem; font-size: 0.875rem; }
    .bc-btn--lg { padding: 0.75rem 1.5rem; font-size: 1rem; }
    .bc-btn--primary { background: var(--color-primary); color: #fff; }
    .bc-btn--primary:hover:not(:disabled) { background: var(--color-primary-hover); }
    .bc-btn--secondary { background: var(--color-secondary); color: #fff; }
    .bc-btn--secondary:hover:not(:disabled) { filter: brightness(1.05); }
    .bc-btn--outline { background: transparent; color: var(--color-primary); border: 1px solid var(--color-primary); }
    .bc-btn--outline:hover:not(:disabled) { background: var(--color-primary-light); }
    .bc-btn--ghost { background: transparent; color: var(--color-text); }
    .bc-btn--ghost:hover:not(:disabled) { background: var(--color-surface-hover); }
    .bc-btn--danger { background: var(--color-danger); color: #fff; }
    .bc-btn__spinner {
      width: 1rem;
      height: 1rem;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class ButtonComponent {
  readonly variant = input<'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'>('primary');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly clicked = output<MouseEvent>();
}
