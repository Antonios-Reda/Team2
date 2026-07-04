import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiSuccessResponse, NotificationPreferences } from '../../shared/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class NotificationApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/notification`;

  getPreferences() {
    return this.http.get<{ status: string; data: NotificationPreferences }>(
      `${this.baseUrl}/preferences`
    );
  }

  updatePreferences(data: Partial<Pick<NotificationPreferences, 'pushEnabled' | 'emailEnabled'>>) {
    return this.http.patch<{ status: string; data: NotificationPreferences }>(
      `${this.baseUrl}/preferences`,
      data
    );
  }

  registerFcmToken(fcmToken: string) {
    return this.http.post<ApiSuccessResponse<never>>(`${this.baseUrl}/token`, { fcmToken });
  }
}
