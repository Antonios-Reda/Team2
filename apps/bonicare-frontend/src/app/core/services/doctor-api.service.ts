import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  ApiSuccessResponse,
  DoctorProfile,
  DoctorAvailability,
  Appointment,
  UpdateDoctorProfileRequest,
  AddAvailabilityRequest,
} from '../../shared/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class DoctorApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/doctor`;

  getProfile() {
    return this.http.get<ApiSuccessResponse<DoctorProfile>>(`${this.baseUrl}/profile`);
  }

  updateProfile(data: UpdateDoctorProfileRequest) {
    return this.http.put<ApiSuccessResponse<DoctorProfile>>(`${this.baseUrl}/profile`, data);
  }

  getAvailability() {
    return this.http.get<ApiSuccessResponse<DoctorAvailability[]>>(`${this.baseUrl}/availability`);
  }

  addAvailability(data: AddAvailabilityRequest) {
    return this.http.post<ApiSuccessResponse<DoctorAvailability>>(`${this.baseUrl}/availability`, data);
  }

  deleteAvailability(id: string) {
    return this.http.delete<ApiSuccessResponse<never>>(`${this.baseUrl}/availability/${id}`);
  }

  getAppointments() {
    return this.http.get<ApiSuccessResponse<Appointment[]>>(`${this.baseUrl}/appointments`);
  }
}
