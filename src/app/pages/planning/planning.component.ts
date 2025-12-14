import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ScheduleService, CreateTripStopsPayload } from '../../services/schedule.service';
import { StopService } from '../../services/stop.service';
import { VehicleService, VehicleResponse } from '../../services/vehicles.service';

import { PlannedStopTime } from '../../models/planned-stop-time.model';
import { Stop } from '../../models/stop.model';

type TripStopRow = {
  stopId: number | null;
  sequence: number;
  arrivalTime: string;           // HH:mm
  departureTime?: string | null; // HH:mm
  active: boolean;
};

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.css']
})
export class PlanningComponent implements OnInit {

  // =======================
  // BASE DATES (safe init)
  // =======================
  today = new Date().toISOString().slice(0, 10);
  nowTime = new Date().toTimeString().slice(0, 5);

  // =======================
  // SCHEDULE STATE
  // =======================
  loading = false;
  error: string | null = null;

  list: PlannedStopTime[] = [];
  stops: Stop[] = [];

  // search
  sLineId: number | null = null;
  sStopId: number | null = null;
  sDate: string;

  // next departures
  nLineId: number | null = null;
  nStopId: number | null = null;
  nDate: string;
  nFromTime: string;
  nLimit = 5;
  nextList: PlannedStopTime[] = [];

  // create/update schedule form (single row)
  form: PlannedStopTime;
  editId: number | null = null;

  // =======================
  // STOPS CRUD
  // =======================
  stopLoading = false;
  stopError: string | null = null;

  stopQ = '';
  stopEditId: number | null = null;

  stopForm: Stop = {
    name: '',
    code: '',
    latitude: 0,
    longitude: 0
  };

  // =======================
  // TRIP BUILDER (bulk create)
  // =======================
  tripLoading = false;
  tripError: string | null = null;
  tripSuccess: string | null = null;

  tripLineId: number | null = 1;
  tripRouteId: number | null = 1;
  tripCode = 'L1_08H30_A';
  tripDate: string;

  tripStops: TripStopRow[] = [
    { stopId: null, sequence: 1, arrivalTime: '08:30', departureTime: '08:32', active: true }
  ];

  // =======================
  // VEHICLES & START TRIP
  // =======================
  vehicles: VehicleResponse[] = [];
  vLoading = false;
  vError: string | null = null;

  startVehicleId: number | null = null;
  startTripCode = '';
  startServiceDate: string;

  tripPreviewLoading = false;
  tripPreview: PlannedStopTime[] = [];

  constructor(
    private scheduleService: ScheduleService,
    private stopService: StopService,
    private vehicleService: VehicleService
  ) {
    // ✅ init values (no TS2729)
    this.sDate = this.today;
    this.nDate = this.today;
    this.nFromTime = this.nowTime;
    this.tripDate = this.today;
    this.startServiceDate = this.today;

    this.form = {
      lineId: 1,
      routeId: 1,
      tripCode: '',
      stopId: 1,
      serviceDate: this.today,
      plannedArrivalTime: '08:00',
      plannedDepartureTime: '08:00',
      stopSequence: 1,
      active: true
    };
  }

  ngOnInit(): void {
    this.loadStops();
    this.loadVehicles(); // ✅ IMPORTANT
  }

  // =======================
  // STOPS METHODS
  // =======================
  loadStops() {
    this.stopLoading = true;
    this.stopError = null;

    this.stopService.getAll().subscribe({
      next: (data) => {
        this.stops = data ?? [];
        this.stopLoading = false;

        if (this.stops.length) {
          // default stop selection for single-row form
          if (!this.form.stopId || this.form.stopId === 1) {
            this.form.stopId = this.stops[0].id!;
          }
          // default stop selection for trip builder row
          if (this.tripStops.length && this.tripStops[0].stopId === null) {
            this.tripStops[0].stopId = this.stops[0].id!;
          }
        }
      },
      error: () => {
        this.stopError = 'Erreur chargement stops';
        this.stopLoading = false;
      }
    });
  }

  filteredStops(): Stop[] {
    const q = (this.stopQ || '').trim().toLowerCase();
    if (!q) return this.stops;

    return this.stops.filter(s =>
      (s.name || '').toLowerCase().includes(q) ||
      (s.code || '').toLowerCase().includes(q) ||
      String(s.id ?? '').includes(q)
    );
  }

  stopResetForm() {
    this.stopEditId = null;
    this.stopForm = { name: '', code: '', latitude: 0, longitude: 0 };
  }

  stopEdit(s: Stop) {
    this.stopEditId = s.id ?? null;
    this.stopForm = {
      name: s.name ?? '',
      code: s.code ?? '',
      latitude: Number(s.latitude ?? 0),
      longitude: Number(s.longitude ?? 0)
    };
  }

  stopCancelEdit() {
    this.stopResetForm();
  }

  stopSubmit() {
    this.stopError = null;

    if (!this.stopForm.name?.trim()) {
      this.stopError = 'Nom obligatoire';
      return;
    }
    if (this.stopForm.latitude === null || this.stopForm.longitude === null) {
      this.stopError = 'Latitude et longitude obligatoires';
      return;
    }

    const payload: Stop = {
      name: this.stopForm.name.trim(),
      code: this.stopForm.code ? this.stopForm.code.trim() : null,
      latitude: Number(this.stopForm.latitude),
      longitude: Number(this.stopForm.longitude)
    };

    if (this.stopEditId) {
      this.stopService.update(this.stopEditId, payload).subscribe({
        next: () => { this.stopResetForm(); this.loadStops(); },
        error: () => this.stopError = 'Update stop échoué'
      });
      return;
    }

    this.stopService.create(payload).subscribe({
      next: () => { this.stopResetForm(); this.loadStops(); },
      error: () => this.stopError = 'Create stop échoué'
    });
  }

  stopRemove(s: Stop) {
    if (!s.id) return;
    if (!confirm(`Supprimer le stop #${s.id} (${s.name}) ?`)) return;

    this.stopService.delete(s.id).subscribe({
      next: () => {
        this.stops = this.stops.filter(x => x.id !== s.id);

        if (this.form.stopId === s.id && this.stops.length) {
          this.form.stopId = this.stops[0].id!;
        }

        this.tripStops = this.tripStops.map(r => ({
          ...r,
          stopId: r.stopId === s.id ? null : r.stopId
        }));
      },
      error: () => this.stopError = 'Delete stop échoué'
    });
  }

  getStopName(stopId: number): string {
    const s = this.stops.find(x => x.id === stopId);
    return s ? s.name : 'Unknown stop';
  }

  // =======================
  // SCHEDULE METHODS
  // =======================
  search() {
    this.loading = true;
    this.error = null;

    this.scheduleService.search({
      lineId: this.sLineId ?? undefined,
      stopId: this.sStopId ?? undefined,
      date: this.sDate || undefined
    }).subscribe({
      next: (data) => { this.list = data ?? []; this.loading = false; },
      error: () => { this.error = 'Erreur chargement schedule'; this.loading = false; }
    });
  }

  loadLine() {
    if (!this.sLineId) { this.error = 'LineId obligatoire'; return; }
    this.loading = true;
    this.scheduleService.getForLine(this.sLineId, this.sDate).subscribe({
      next: (data) => { this.list = data ?? []; this.loading = false; },
      error: () => { this.error = 'Erreur getForLine'; this.loading = false; }
    });
  }

  loadStop() {
    if (!this.sStopId) { this.error = 'StopId obligatoire'; return; }
    this.loading = true;
    this.scheduleService.getForStop(this.sStopId, this.sDate).subscribe({
      next: (data) => { this.list = data ?? []; this.loading = false; },
      error: () => { this.error = 'Erreur getForStop'; this.loading = false; }
    });
  }

  loadLineStop() {
    if (!this.sLineId || !this.sStopId) { this.error = 'LineId + StopId obligatoires'; return; }
    this.loading = true;
    this.scheduleService.getForLineAndStop(this.sLineId, this.sStopId, this.sDate).subscribe({
      next: (data) => { this.list = data ?? []; this.loading = false; },
      error: () => { this.error = 'Erreur line+stop'; this.loading = false; }
    });
  }

  nextDepartures() {
    this.error = null;
    if (!this.nLineId || !this.nStopId) { this.error = 'LineId + StopId obligatoires'; return; }

    this.scheduleService.nextDepartures(
      this.nLineId, this.nStopId, this.nDate, this.nFromTime, this.nLimit
    ).subscribe({
      next: (data) => this.nextList = data ?? [],
      error: () => this.error = 'Erreur next departures'
    });
  }

  submit() {
    this.error = null;

    if (!this.form.lineId || !this.form.routeId || !this.form.stopId || !this.form.serviceDate || !this.form.plannedArrivalTime) {
      this.error = 'Champs obligatoires manquants';
      return;
    }

    const payload: PlannedStopTime = {
      ...this.form,
      tripCode: this.form.tripCode ? this.form.tripCode.trim() : null,
      plannedDepartureTime: this.form.plannedDepartureTime ? this.form.plannedDepartureTime : null
    };

    if (this.editId) {
      this.scheduleService.update(this.editId, payload).subscribe({
        next: () => { this.cancelEdit(); this.search(); },
        error: () => this.error = 'Update échoué'
      });
    } else {
      this.scheduleService.create(payload).subscribe({
        next: () => { this.resetForm(); this.search(); },
        error: () => this.error = 'Create échoué'
      });
    }
  }

  edit(row: PlannedStopTime) {
    this.editId = row.id ?? null;
    this.form = {
      lineId: row.lineId,
      routeId: row.routeId,
      tripCode: row.tripCode ?? '',
      stopId: row.stopId,
      serviceDate: row.serviceDate,
      plannedArrivalTime: (row.plannedArrivalTime || '').slice(0, 5),
      plannedDepartureTime: row.plannedDepartureTime ? row.plannedDepartureTime.slice(0, 5) : '',
      stopSequence: row.stopSequence ?? null,
      active: row.active
    };
  }

  cancelEdit() {
    this.editId = null;
    this.resetForm();
  }

  resetForm() {
    this.form = {
      lineId: 1,
      routeId: 1,
      tripCode: '',
      stopId: this.stops.length ? this.stops[0].id! : 1,
      serviceDate: this.sDate,
      plannedArrivalTime: '08:00',
      plannedDepartureTime: '08:00',
      stopSequence: 1,
      active: true
    };
  }

  remove(row: PlannedStopTime) {
    if (!row.id) return;
    this.scheduleService.delete(row.id).subscribe({
      next: () => this.list = this.list.filter(x => x.id !== row.id),
      error: () => this.error = 'Delete échoué'
    });
  }

  // =======================
  // TRIP BUILDER METHODS
  // =======================
  addTripStopRow() {
    const nextSeq = (this.tripStops[this.tripStops.length - 1]?.sequence ?? 0) + 1;
    const defaultStopId = this.stops.length ? this.stops[0].id! : null;

    this.tripStops.push({
      stopId: defaultStopId,
      sequence: nextSeq,
      arrivalTime: '08:00',
      departureTime: '08:00',
      active: true
    });
  }

  removeTripStopRow(i: number) {
    if (this.tripStops.length === 1) return;
    this.tripStops.splice(i, 1);
    this.tripStops = this.tripStops.map((r, idx) => ({ ...r, sequence: idx + 1 }));
  }

  moveTripStopRowUp(i: number) {
    if (i <= 0) return;
    const tmp = this.tripStops[i - 1];
    this.tripStops[i - 1] = this.tripStops[i];
    this.tripStops[i] = tmp;
    this.tripStops = this.tripStops.map((r, idx) => ({ ...r, sequence: idx + 1 }));
  }

  moveTripStopRowDown(i: number) {
    if (i >= this.tripStops.length - 1) return;
    const tmp = this.tripStops[i + 1];
    this.tripStops[i + 1] = this.tripStops[i];
    this.tripStops[i] = tmp;
    this.tripStops = this.tripStops.map((r, idx) => ({ ...r, sequence: idx + 1 }));
  }

  createTripStops() {
    this.tripError = null;
    this.tripSuccess = null;

    if (!this.tripLineId || !this.tripRouteId) {
      this.tripError = 'tripLineId et tripRouteId obligatoires';
      return;
    }
    if (!this.tripCode?.trim()) {
      this.tripError = 'tripCode obligatoire';
      return;
    }
    if (!this.tripDate) {
      this.tripError = 'serviceDate obligatoire';
      return;
    }

    for (const r of this.tripStops) {
      if (!r.stopId) { this.tripError = 'Chaque ligne doit avoir un stop'; return; }
      if (!r.arrivalTime) { this.tripError = 'arrivalTime obligatoire'; return; }
      if (!r.sequence || r.sequence < 1) { this.tripError = 'sequence invalide'; return; }
    }

    const payload: CreateTripStopsPayload = {
      lineId: this.tripLineId,
      routeId: this.tripRouteId,
      tripCode: this.tripCode.trim(),
      serviceDate: this.tripDate,
      stops: this.tripStops.map(r => ({
        stopId: r.stopId!,
        sequence: r.sequence,
        arrivalTime: r.arrivalTime,
        departureTime: r.departureTime ? r.departureTime : null,
        active: r.active
      }))
    };

    this.tripLoading = true;

    this.scheduleService.createTripStops(payload).subscribe({
      next: (created) => {
        this.tripLoading = false;
        this.tripSuccess = `✅ ${created?.length ?? 0} stops enregistrés pour ${payload.tripCode}`;
        this.search();
      },
      error: () => {
        this.tripLoading = false;
        this.tripError = 'Erreur createTripStops';
      }
    });
  }

  loadTripStops() {
    this.tripError = null;
    this.tripSuccess = null;

    if (!this.tripCode?.trim() || !this.tripDate) {
      this.tripError = 'tripCode et date obligatoires';
      return;
    }

    this.tripLoading = true;

    this.scheduleService.getTripStops(this.tripCode.trim(), this.tripDate).subscribe({
      next: (data) => {
        this.tripLoading = false;
        this.list = data ?? [];
        this.tripSuccess = `✅ ${this.list.length} stops trouvés pour ${this.tripCode}`;
      },
      error: () => {
        this.tripLoading = false;
        this.tripError = 'Erreur getTripStops';
      }
    });
  }

  // =======================
  // VEHICLES METHODS (REAL)
  // =======================
  loadVehicles() {
    this.vLoading = true;
    this.vError = null;

    this.vehicleService.getAll().subscribe({
      next: (data) => {
        console.log('✅ vehicles loaded in Planning =', data);
        this.vehicles = data ?? [];
        this.vLoading = false;

        if (!this.startVehicleId && this.vehicles.length) {
          this.startVehicleId = this.vehicles[0].id;
        }
      },
      error: (err) => {
        console.error('❌ loadVehicles Planning error', err);
        this.vError = 'Erreur chargement véhicules';
        this.vLoading = false;
      }
    });
  }

  previewTripStopsForStartTrip() {
    this.vError = null;

    if (!this.startTripCode?.trim() || !this.startServiceDate) {
      this.vError = 'Trip code et date obligatoires';
      return;
    }

    this.tripPreviewLoading = true;

    this.scheduleService.getTripStops(this.startTripCode.trim(), this.startServiceDate).subscribe({
      next: (data) => {
        this.tripPreview = data ?? [];
        this.tripPreviewLoading = false;
      },
      error: () => {
        this.vError = 'Erreur chargement trip stops';
        this.tripPreviewLoading = false;
      }
    });
  }

  startTrip() {
    this.vError = null;

    if (!this.startVehicleId) {
      this.vError = 'Véhicule obligatoire';
      return;
    }
    if (!this.startTripCode?.trim() || !this.startServiceDate) {
      this.vError = 'Trip code et date obligatoires';
      return;
    }

    this.vehicleService.startTrip(this.startVehicleId!, {
  tripCode: this.startTripCode.trim(),
  serviceDate: this.startServiceDate
}).subscribe({
  next: () => this.loadVehicles(),
  error: (err : any) => this.vError = err?.error?.message || 'Erreur démarrage trip'
});

  }
}
