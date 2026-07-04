import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'appointmentStatus', standalone: true })
export class AppointmentStatusPipe implements PipeTransform {
  private readonly labels: Record<string, string> = {
    scheduled: 'Scheduled',
    completed: 'Completed',
    cancelled: 'Cancelled',
    'no-show': 'No Show',
    awaiting_payment: 'Awaiting Payment',
    payment_failed: 'Payment Failed',
  };

  transform(status: string): string {
    return this.labels[status] ?? status;
  }
}

@Pipe({ name: 'statusVariant', standalone: true })
export class StatusVariantPipe implements PipeTransform {
  transform(status: string): 'default' | 'primary' | 'success' | 'warning' | 'danger' {
    switch (status) {
      case 'scheduled':
      case 'completed':
        return 'success';
      case 'awaiting_payment':
        return 'warning';
      case 'cancelled':
      case 'payment_failed':
      case 'no-show':
        return 'danger';
      default:
        return 'default';
    }
  }
}
