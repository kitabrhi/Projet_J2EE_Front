import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface VehicleCreateRequest {
  code: string;         // obligatoire
  lineId?: number;
  driverId?: number;
}

export interface UpdatePositionRequest {
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
}

export interface VehicleResponse {
  id: number;
  code: string;
  lineId?: number;
  driverId?: number;

  latitude?: number;
  longitude?: number;
  speed?: number;
  heading?: number;

  lastPositionTime?: string;
  signalState?: string;
  status?: string;

  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  // GET /vehicles?lineId=...
  getAll(lineId?: number): Observable<VehicleResponse[]> {
    const url = lineId != null
      ? `${this.baseUrl}/vehicles?lineId=${lineId}`
      : `${this.baseUrl}/vehicles`;
    return this.http.get<VehicleResponse[]>(url);
  }

  // GET /vehicles/{id}
  getById(id: number): Observable<VehicleResponse> {
    return this.http.get<VehicleResponse>(`${this.baseUrl}/vehicles/${id}`);
  }

  // POST /vehicles
  create(req: VehicleCreateRequest): Observable<VehicleResponse> {
    console.log('POST /vehicles payload =>', req);
    return this.http.post<VehicleResponse>(`${this.baseUrl}/vehicles`, req);
  }

  // PUT /vehicles/{id}/position
  updatePosition(id: number, req: UpdatePositionRequest): Observable<VehicleResponse> {
    console.log(`PUT /vehicles/${id}/position payload =>`, req);
    return this.http.put<VehicleResponse>(`${this.baseUrl}/vehicles/${id}/position`, req);
  }
}
