import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Alert } from '../models/alert.model';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private baseUrl = 'http://localhost:8080/driver/alerts';

  constructor(private http: HttpClient) {}

  getOpen(): Observable<Alert[]> {
    return this.http.get<Alert[]>(`${this.baseUrl}/open`);
  }

  getForVehicle(vehicleId: number): Observable<Alert[]> {
    return this.http.get<Alert[]>(`${this.baseUrl}/vehicle/${vehicleId}`);
  }

  getForLine(lineId: number): Observable<Alert[]> {
    return this.http.get<Alert[]>(`${this.baseUrl}/line/${lineId}`);
  }

  getForStop(stopId: number): Observable<Alert[]> {
    return this.http.get<Alert[]>(`${this.baseUrl}/stop/${stopId}`);
  }

  getRecent(limit = 10): Observable<Alert[]> {
    return this.http.get<Alert[]>(`${this.baseUrl}/recent`, {
      params: new HttpParams().set('limit', limit)
    });
  }

  search(filters: {
    status?: string;
    severity?: string;
    vehicleId?: number;
    lineId?: number;
    stopId?: number;
    fromDate?: string; // yyyy-MM-ddTHH:mm
    toDate?: string;   // yyyy-MM-ddTHH:mm
  }): Observable<Alert[]> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params = params.set(k, String(v));
      }
    });

    return this.http.get<Alert[]>(`${this.baseUrl}`, { params });
  }

  updateStatus(id: number, status: string): Observable<Alert> {
    const params = new HttpParams().set('status', status);
    return this.http.put<Alert>(`${this.baseUrl}/${id}/status`, null, { params });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  statsByStatus(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(`${this.baseUrl}/stats/status`);
  }

  statsBySeverity(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(`${this.baseUrl}/stats/severity`);
  }
}
