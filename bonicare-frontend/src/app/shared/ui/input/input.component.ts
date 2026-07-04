import { Component, input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'bc-input',
  standalone: true,
  imports: [FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="bc-field">
      @if (label()) {
        <label [for]="inputId" class="bc-field__label">{{ label() }}</label>
      }
      <input
        [id]="inputId"
        [type]="type()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [attr.aria-invalid]="!!error()"
        class="bc-field__input"
        [class.bc-field__input--error]="!!error()"
        [(ngModel)]="value"
        (ngModelChange)="onChange($event)"
        (blur)="onTouched()"
      />
      @if (error()) {
        <span class="bc-field__error" role="alert">{{ error() }}</span>
      }
      @if (hint() && !error()) {
        <span class="bc-field__hint">{{ hint() }}</span>
      }
    </div>
  `,
  styles: [`
    .bc-field { display: flex; flex-direction: column; gap: 0.375rem; }
    .bc-field__label { font-size: 0.875rem; font-weight: 500; color: var(--color-text); }
    .bc-field__input {
      padding: 0.625rem 0.875rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      color: var(--color-text);
      font-size: 0.875rem;
      font-family: inherit;
      transition: border-color 0.15s;
    }
    .bc-field__input:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-light);
    }
    .bc-field__input--error { border-color: var(--color-danger); }
    .bc-field__error { font-size: 0.75rem; color: var(--color-danger); }
    .bc-field__hint { font-size: 0.75rem; color: var(--color-text-muted); }
  `],
})
export class InputComponent implements ControlValueAccessor {
  readonly label = input<string>();
  readonly type = input('text');
  readonly placeholder = input('');
  readonly error = input<string>();
  readonly hint = input<string>();
  readonly inputId = `bc-input-${Math.random().toString(36).slice(2, 9)}`;

  value = '';
  disabled = input(false);

  private onChangeFn: (v: string) => void = () => {};
  private onTouchedFn: () => void = () => {};

  writeValue(value: string): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // handled via input binding
  }

  onChange(value: string): void {
    this.onChangeFn(value);
  }

  onTouched(): void {
    this.onTouchedFn();
  }
}
