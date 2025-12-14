import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StartTripRequest } from '../models/start-trip.model';

export interface VehicleCreateRequest {
  code: string;
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

  lineId?: number | null;
  driverId?: number | null;

  latitude?: number | null;
  longitude?: number | null;
  speed?: number | null;
  heading?: number | null;

  lastPositionTime?: string | null;

  status?: string | null;
  signalState?: string | null;

  createdAt?: string | null;
  updatedAt?: string | null;

  currentTripCode?: string | null;
  currentServiceDate?: string | null;
  tripStartedAt?: string | null;
  tripStatus?: string | null;
}

@Injectable({ providedIn: 'root' })
export class VehicleService {
 
  // ⚠️ adapte selon ton gateway
  private readonly baseUrl = 'http://localhost:8080/vehicles';

  constructor(private http: HttpClient) {}

  getAll(lineId?: number): Observable<VehicleResponse[]> {
    let params = new HttpParams();
    if (lineId != null) params = params.set('lineId', String(lineId));
    return this.http.get<VehicleResponse[]>(this.baseUrl, { params });
  }

  getById(id: number): Observable<VehicleResponse> {
    return this.http.get<VehicleResponse>(`${this.baseUrl}/${id}`);
  }

  create(payload: VehicleCreateRequest): Observable<VehicleResponse> {
    return this.http.post<VehicleResponse>(this.baseUrl, payload);
  }

  updatePosition(id: number, payload: UpdatePositionRequest): Observable<VehicleResponse> {
    return this.http.put<VehicleResponse>(`${this.baseUrl}/${id}/position`, payload);
  }

  startTrip(vehicleId: number, payload: StartTripRequest): Observable<VehicleResponse> {
    return this.http.post<VehicleResponse>(`${this.baseUrl}/${vehicleId}/start-trip`, payload);
  }
}
