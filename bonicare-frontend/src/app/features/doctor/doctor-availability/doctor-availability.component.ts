import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DoctorApiService } from '../../../core/services/doctor-api.service';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { DoctorAvailability } from '../../../shared/models/api-response.model';

@Component({
  selector: 'bc-doctor-availability',
  standalone: true,
  imports: [ReactiveFormsModule, CardComponent, ButtonComponent, InputComponent],
  template: `
    <div class="page">
      <h2>Manage Availability</h2>
      <bc-card title="Add Time Slot">
        <form [formGroup]="form" (ngSubmit)="addSlot()" class="form">
          <bc-input label="Day of Week" formControlName="dayOfWeek" placeholder="Monday" />
          <bc-input label="Start Time" formControlName="startTime" placeholder="09:00" />
          <bc-input label="End Time" formControlName="endTime" placeholder="17:00" />
          <bc-button type="submit" [loading]="saving()">Add Slot</bc-button>
        </form>
      </bc-card>
      <bc-card title="Current Slots">
        @for (slot of slots(); track slot._id) {
          <div class="slot">
            <span>{{ slot.dayOfWeek }}: {{ slot.startTime }} – {{ slot.endTime }}</span>
            <bc-button variant="danger" size="sm" (clicked)="deleteSlot(slot._id)">Remove</bc-button>
          </div>
        } @empty {
          <p class="muted">No availability slots configured.</p>
        }
      </bc-card>
    </div>
  `,
  styles: [`
    .page h2 { margin-bottom: 1.5rem; }
    .form { display: flex; flex-direction: column; gap: 1rem; max-width: 24rem; }
    .slot {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0.75rem; background: var(--color-bg); border-radius: var(--radius-md); margin-bottom: 0.5rem;
    }
    .muted { color: var(--color-text-muted); font-size: 0.875rem; }
  `],
})
export class DoctorAvailabilityComponent implements OnInit {
  private readonly api = inject(DoctorApiService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  readonly slots = signal<DoctorAvailability[]>([]);
  readonly saving = signal(false);

  readonly form = this.fb.nonNullable.group({
    dayOfWeek: ['', Validators.required],
    startTime: ['', Validators.required],
    endTime: ['', Validators.required],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.getAvailability().subscribe((res) => this.slots.set(res.data ?? []));
  }

  addSlot(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.api.addAvailability(this.form.getRawValue()).subscribe({
      next: () => {
        this.form.reset();
        this.load();
        this.toast.success('Slot added');
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }

  deleteSlot(id: string): void {
    this.api.deleteAvailability(id).subscribe({
      next: () => {
        this.load();
        this.toast.success('Slot removed');
      },
    });
  }
}
