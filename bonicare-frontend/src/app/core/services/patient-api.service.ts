import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  ApiSuccessResponse,
  PatientProfile,
  MedicalFile,
  AiReport,
  Appointment,
} from '../../shared/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class PatientApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/patient`;

  getDashboard() {
    return this.http.get<ApiSuccessResponse<never> & {
      patient: PatientProfile;
      files: MedicalFile[];
      ai_reports: AiReport[];
      appointments: Appointment[];
    }>(`${this.baseUrl}/dashboard`);
  }
}
