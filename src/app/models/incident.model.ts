export type IncidentStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Incident {
  id?: number;
  vehicleId?: number | null;
  lineId?: number | null;
  tripId?: string | null;
  stopId?: number | null;

  type: string;        // ex: ACCIDENT, BREAKDOWN... (selon ton enum)
  severity: IncidentSeverity;
  status?: IncidentStatus;

  description?: string | null;
  reportedBy?: string | null;

  reportedAt?: string; // ISO string
}
