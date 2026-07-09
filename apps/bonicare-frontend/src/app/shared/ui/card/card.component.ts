import { Component, input } from '@angular/core';

@Component({
  selector: 'bc-card',
  standalone: true,
  template: `
    <div class="bc-card" [class.bc-card--padding]="padding()">
      @if (title()) {
        <div class="bc-card__header">
          <h3 class="bc-card__title">{{ title() }}</h3>
          @if (subtitle()) {
            <p class="bc-card__subtitle">{{ subtitle() }}</p>
          }
        </div>
      }
      <div class="bc-card__body">
        <ng-content />
      </div>
    </div>
  `,
  styles: [`
    .bc-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }
    .bc-card--padding .bc-card__body { padding: 1.5rem; }
    .bc-card__header {
      padding: 1.25rem 1.5rem 0;
      border-bottom: none;
    }
    .bc-card__title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-text);
    }
    .bc-card__subtitle {
      margin: 0.25rem 0 0;
      font-size: 0.875rem;
      color: var(--color-text-muted);
    }
  `],
})
export class CardComponent {
  readonly title = input<string>();
  readonly subtitle = input<string>();
  readonly padding = input(true);
}
