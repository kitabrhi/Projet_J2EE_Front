export interface PlannedStopTime {
  id?: number;

  lineId: number;
  routeId: number;
  tripCode?: string | null;
  stopId: number;

  serviceDate: string;           // "YYYY-MM-DD"
  plannedArrivalTime: string;    // "HH:mm:ss" ou "HH:mm"
  plannedDepartureTime?: string | null;

  stopSequence?: number | null;
  active: boolean;
}
