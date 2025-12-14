import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_BASE_URL } from '../config/api.config';
import { Incident } from '../models/incident.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IncidentService {
  private base = `${API_BASE_URL}/driver/incidents`;

  constructor(private http: HttpClient) {}

  create(payload: Incident): Observable<Incident> {
    return this.http.post<Incident>(this.base, payload);
  }

  getById(id: number): Observable<Incident> {
    return this.http.get<Incident>(`${this.base}/${id}`);
  }

  getOpen(): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.base}/open`);
  }

  getByVehicle(vehicleId: number): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.base}/vehicle/${vehicleId}`);
  }

  updateStatus(id: number, status: string): Observable<Incident> {
    const params = new HttpParams().set('status', status);
    return this.http.put<Incident>(`${this.base}/${id}/status`, null, { params });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  recent(limit = 10): Observable<Incident[]> {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<Incident[]>(`${this.base}/recent`, { params });
  }

  getByReporter(reportedBy: string): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.base}/driver/${encodeURIComponent(reportedBy)}`);
  }

  getByLine(lineId: number): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.base}/line/${lineId}`);
  }

  statsByStatus(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(`${this.base}/stats/status`);
  }

  search(filters: {
    status?: string;
    severity?: string;
    vehicleId?: number;
    reportedBy?: string;
    lineId?: number;
    fromDate?: string; // ISO
    toDate?: string;   // ISO
  }): Observable<Incident[]> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<Incident[]>(this.base, { params });
  }
}
