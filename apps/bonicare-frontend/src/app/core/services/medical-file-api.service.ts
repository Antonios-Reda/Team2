import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiSuccessResponse, MedicalFile } from '../../shared/models/api-response.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MedicalFileApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/files`;

  upload(file: File): Observable<HttpEvent<ApiSuccessResponse<MedicalFile>>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiSuccessResponse<MedicalFile>>(`${this.baseUrl}/upload`, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }

  getDownloadUrl(filename: string): string {
    return `${this.baseUrl}/${filename}`;
  }
}
