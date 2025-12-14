export interface VehicleResponse {
  id: number;
  plateNumber?: string;
  lineId?: number;

  latitude?: number;
  longitude?: number;
  speed?: number;
  heading?: number;

  delayMinutes?: number;
  updatedAt?: string;
}

export interface CreateVehicleRequest {
  plateNumber: string;
  lineId: number;
}

export interface UpdatePositionRequest {
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  delayMinutes?: number;
  
}

export interface Vehicle {
  id?: number;
  code: string;
  lineId?: number | null;
  driverId?: number | null;

  latitude?: number | null;
  longitude?: number | null;
  speed?: number | null;
  heading?: number | null;

  currentTripCode?: string | null;
  currentServiceDate?: string | null;
  tripStartedAt?: string | null;
  tripStatus?: string | null; // IDLE / RUNNING / FINISHED
}

