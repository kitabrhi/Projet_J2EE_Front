import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_BASE_URL } from '../config/api.config';
import { Observable } from 'rxjs';
import { PlannedStopTime } from '../models/planned-stop-time.model';

@Injectable({ providedIn: 'root' })
export class ScheduleService {

  private base = `${API_BASE_URL}/schedule`;

  constructor(private http: HttpClient) {}

  create(payload: PlannedStopTime): Observable<PlannedStopTime> {
    return this.http.post<PlannedStopTime>(this.base, payload);
  }

  getById(id: number): Observable<PlannedStopTime> {
    return this.http.get<PlannedStopTime>(`${this.base}/${id}`);
  }

  update(id: number, payload: PlannedStopTime): Observable<PlannedStopTime> {
    return this.http.put<PlannedStopTime>(`${this.base}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  getForLine(lineId: number, date: string): Observable<PlannedStopTime[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<PlannedStopTime[]>(`${this.base}/line/${lineId}`, { params });
  }

  getForStop(stopId: number, date: string): Observable<PlannedStopTime[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<PlannedStopTime[]>(`${this.base}/stop/${stopId}`, { params });
  }

  search(filters: { lineId?: number; stopId?: number; date?: string; }): Observable<PlannedStopTime[]> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<PlannedStopTime[]>(this.base, { params });
  }

  getForLineAndStop(lineId: number, stopId: number, date: string): Observable<PlannedStopTime[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<PlannedStopTime[]>(`${this.base}/line/${lineId}/stop/${stopId}`, { params });
  }

  nextDepartures(lineId: number, stopId: number, date: string, fromTime: string, limit = 5): Observable<PlannedStopTime[]> {
    let params = new HttpParams()
      .set('lineId', lineId)
      .set('stopId', stopId)
      .set('date', date)
      .set('fromTime', fromTime)
      .set('limit', limit);

    return this.http.get<PlannedStopTime[]>(`${this.base}/next`, { params });
  }
}
