import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { Stop } from '../models/stop.model';

@Injectable({ providedIn: 'root' })
export class StopService {
  private base = `${API_BASE_URL}/schedule/stops`;

  constructor(private http: HttpClient) {}

  create(payload: Stop): Observable<Stop> {
    return this.http.post<Stop>(this.base, payload);
  }

  getAll(): Observable<Stop[]> {
    return this.http.get<Stop[]>(this.base);
  }

  getById(id: number): Observable<Stop> {
    return this.http.get<Stop>(`${this.base}/${id}`);
  }

  update(id: number, payload: Stop): Observable<Stop> {
    return this.http.put<Stop>(`${this.base}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
