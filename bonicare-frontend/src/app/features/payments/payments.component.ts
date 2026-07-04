import { Component, inject, signal, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';
import { PaymentApiService } from '../../core/services/payment-api.service';
import { AppointmentApiService } from '../../core/services/appointment-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { CardComponent } from '../../shared/ui/card/card.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { DateFormatPipe } from '../../shared/pipes/date-format.pipe';
import { AppointmentStatusPipe, StatusVariantPipe } from '../../shared/pipes/status.pipe';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { Appointment } from '../../shared/models/api-response.model';

@Component({
  selector: 'bc-payments',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CardComponent,
    ButtonComponent,
    InputComponent,
    DateFormatPipe,
    AppointmentStatusPipe,
  ],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.scss',
})
export class PaymentsComponent implements OnInit {
  @ViewChild('paymentElement') paymentElementRef!: ElementRef<HTMLDivElement>;

  private readonly paymentApi = inject(PaymentApiService);
  private readonly appointmentApi = inject(AppointmentApiService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  readonly isPatient = this.auth.hasRole('patient');
  readonly appointments = signal<Appointment[]>([]);
  readonly processing = signal(false);
  readonly stripeReady = signal(false);
  readonly clientSecret = signal<string | null>(null);

  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;

  readonly paymentForm = this.fb.nonNullable.group({
    appointmentId: ['', Validators.required],
    amount: [5000, [Validators.required, Validators.min(50)]],
    type: ['full_payment' as 'full_payment' | 'deposit', Validators.required],
  });

  ngOnInit(): void {
    if (this.isPatient) {
      this.appointmentApi.getMyAppointments().subscribe((res) => {
        this.appointments.set(
          (res.data ?? []).filter((a) => a.status === 'awaiting_payment' || a.status === 'scheduled')
        );
      });
    }
    this.initStripe();
  }

  private async initStripe(): Promise<void> {
    if (!environment.stripePublishableKey.startsWith('pk_')) return;
    this.stripe = await loadStripe(environment.stripePublishableKey);
    this.stripeReady.set(!!this.stripe);
  }

  createIntent(): void {
    if (this.paymentForm.invalid || !this.isPatient) return;
    this.processing.set(true);

    this.paymentApi.createIntent(this.paymentForm.getRawValue()).subscribe({
      next: async (res) => {
        this.clientSecret.set(res.clientSecret);
        if (this.stripe && res.clientSecret) {
          this.elements = this.stripe.elements({ clientSecret: res.clientSecret });
          const paymentElement = this.elements.create('payment');
          setTimeout(() => {
            if (this.paymentElementRef?.nativeElement) {
              paymentElement.mount(this.paymentElementRef.nativeElement);
            }
          });
        }
        this.processing.set(false);
      },
      error: () => this.processing.set(false),
    });
  }

  async confirmPayment(): Promise<void> {
    if (!this.stripe || !this.elements || !this.clientSecret()) return;
    this.processing.set(true);

    const { error } = await this.stripe.confirmPayment({
      elements: this.elements,
      confirmParams: {
        return_url: `${window.location.origin}/payments?success=true`,
      },
      redirect: 'if_required',
    });

    if (error) {
      this.toast.error(error.message ?? 'Payment failed');
      this.processing.set(false);
    } else {
      this.toast.success('Payment successful!');
      this.clientSecret.set(null);
      this.processing.set(false);
    }
  }

  retry(): void {
    this.clientSecret.set(null);
    this.createIntent();
  }
}
