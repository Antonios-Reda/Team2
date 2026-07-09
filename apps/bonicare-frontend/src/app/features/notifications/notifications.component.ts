import { Component, inject, signal, OnInit } from '@angular/core';
import { NotificationApiService } from '../../core/services/notification-api.service';
import { SocketService } from '../../core/services/socket.service';
import { CardComponent } from '../../shared/ui/card/card.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { NotificationPreferences } from '../../shared/models/api-response.model';

@Component({
  selector: 'bc-notifications',
  standalone: true,
  imports: [CardComponent, ButtonComponent],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
})
export class NotificationsComponent implements OnInit {
  private readonly api = inject(NotificationApiService);
  private readonly socket = inject(SocketService);
  private readonly toast = inject(ToastService);

  readonly prefs = signal<NotificationPreferences | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly socketConnected = this.socket.connected;

  ngOnInit(): void {
    this.api.getPreferences().subscribe({
      next: (res) => {
        this.prefs.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  togglePush(): void {
    const current = this.prefs();
    if (!current) return;
    this.updatePrefs({ pushEnabled: !current.pushEnabled });
  }

  toggleEmail(): void {
    const current = this.prefs();
    if (!current) return;
    this.updatePrefs({ emailEnabled: !current.emailEnabled });
  }

  private updatePrefs(data: Partial<NotificationPreferences>): void {
    this.saving.set(true);
    this.api.updatePreferences(data).subscribe({
      next: (res) => {
        this.prefs.set(res.data);
        this.toast.success('Preferences updated');
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }

  registerPush(): void {
    if (!('Notification' in window)) {
      this.toast.warning('Push notifications not supported in this browser');
      return;
    }

    Notification.requestPermission().then((perm) => {
      if (perm === 'granted') {
        this.api.registerFcmToken(`web-${crypto.randomUUID()}`).subscribe({
          next: () => this.toast.success('Push notifications enabled'),
        });
      }
    });
  }
}
