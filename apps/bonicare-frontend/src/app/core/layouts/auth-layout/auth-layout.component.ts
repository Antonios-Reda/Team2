import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'bc-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="auth-layout">
      <div class="auth-layout__panel">
        <div class="auth-layout__brand">
          <span class="auth-layout__logo">BC</span>
          <h1>BoniCare</h1>
          <p>Professional healthcare platform connecting patients and doctors.</p>
        </div>
      </div>
      <div class="auth-layout__form">
        <router-outlet />
      </div>
    </div>
  `,
  styles: [`
    .auth-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      min-height: 100vh;
    }
    .auth-layout__panel {
      background: linear-gradient(135deg, var(--color-primary) 0%, #1d4ed8 50%, var(--color-secondary) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: #fff;
    }
    .auth-layout__brand { max-width: 24rem; }
    .auth-layout__logo {
      display: inline-flex;
      width: 3.5rem;
      height: 3.5rem;
      background: rgba(255,255,255,0.2);
      border-radius: var(--radius-lg);
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
    }
    .auth-layout__brand h1 { margin: 0 0 0.75rem; font-size: 2.5rem; }
    .auth-layout__brand p { margin: 0; opacity: 0.9; line-height: 1.6; }
    .auth-layout__form {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: var(--color-bg);
    }
    @media (max-width: 768px) {
      .auth-layout { grid-template-columns: 1fr; }
      .auth-layout__panel { display: none; }
    }
  `],
})
export class AuthLayoutComponent {}
