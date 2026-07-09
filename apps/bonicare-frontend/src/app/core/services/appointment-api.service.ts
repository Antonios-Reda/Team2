import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  ApiSuccessResponse,
  Appointment,
  BookAppointmentRequest,
  DoctorProfile,
  DoctorAvailability,
} from '../../shared/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class AppointmentApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/appointment`;

  getDoctors() {
    return this.http.get<ApiSuccessResponse<DoctorProfile[]>>(`${this.baseUrl}/doctors`);
  }

  getDoctorAvailability(doctorId: string) {
    return this.http.get<ApiSuccessResponse<DoctorAvailability[]>>(
      `${this.baseUrl}/doctors/${doctorId}/availability`
    );
  }

  bookAppointment(data: BookAppointmentRequest) {
    return this.http.post<ApiSuccessResponse<Appointment>>(`${this.baseUrl}/book`, data);
  }

  getMyAppointments() {
    return this.http.get<ApiSuccessResponse<Appointment[]>>(`${this.baseUrl}/my-appointments`);
  }

  cancelAppointment(id: string) {
    return this.http.put<ApiSuccessResponse<Appointment>>(`${this.baseUrl}/${id}/cancel`, {});
  }
}
