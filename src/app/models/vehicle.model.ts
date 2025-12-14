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
