export type AlertType = 'DELAY' | 'INCIDENT' | 'NO_SIGNAL';
export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type AlertStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface Alert {
  id: number;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;

  vehicleId?: number | null;
  lineId?: number | null;
  tripId?: string | null;
  stopId?: number | null;

  delayMinutes?: number | null;
  incidentId?: number | null;

  title?: string | null;
  details?: string | null;

  createdAt: string; // ISO string
}
