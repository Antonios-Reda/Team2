import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  PaymentIntentRequest,
  PaymentIntentResponse,
  RefundRequest,
  Payment,
  ApiSuccessResponse,
} from '../../shared/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class PaymentApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/payment`;

  createIntent(data: PaymentIntentRequest) {
    return this.http.post<PaymentIntentResponse>(`${this.baseUrl}/create-intent`, data);
  }

  issueRefund(data: RefundRequest) {
    return this.http.post<{ status: string; data: Payment }>(`${this.baseUrl}/refund`, data);
  }
}
