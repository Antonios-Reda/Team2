import { Component } from '@angular/core';

@Component({
  selector: 'bc-skeleton',
  standalone: true,
  template: `<div class="bc-skeleton" [style.width]="width()" [style.height]="height()"></div>`,
  styles: [`
    .bc-skeleton {
      background: linear-gradient(90deg, var(--color-surface-hover) 25%, var(--color-border) 50%, var(--color-surface-hover) 75%);
      background-size: 200% 100%;
      border-radius: var(--radius-md);
      animation: shimmer 1.5s infinite;
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `],
})
export class SkeletonComponent {
  width = () => '100%';
  height = () => '1rem';
}
