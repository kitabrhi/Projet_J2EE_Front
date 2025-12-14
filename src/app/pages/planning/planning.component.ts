import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScheduleService } from '../../services/schedule.service';
import { PlannedStopTime } from '../../models/planned-stop-time.model';

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.css']
})
export class PlanningComponent implements OnInit {

  loading = false;
  error: string | null = null;

  list: PlannedStopTime[] = [];

  // search
  sLineId: number | null = null;
  sStopId: number | null = null;
  sDate = new Date().toISOString().slice(0, 10); // today YYYY-MM-DD

  // next departures
  nLineId: number | null = null;
  nStopId: number | null = null;
  nDate = this.sDate;
  nFromTime = new Date().toTimeString().slice(0, 5); // HH:mm
  nLimit = 5;
  nextList: PlannedStopTime[] = [];

  // create/update form
  form: PlannedStopTime = {
    lineId: 1,
    routeId: 1,
    tripCode: '',
    stopId: 1,
    serviceDate: this.sDate,
    plannedArrivalTime: '08:00',
    plannedDepartureTime: '08:00',
    stopSequence: 1,
    active: true
  };

  editId: number | null = null;

  constructor(private scheduleService: ScheduleService) {}

  ngOnInit(): void {
    this.search();
  }

  search() {
    this.loading = true;
    this.error = null;

    this.scheduleService.search({
      lineId: this.sLineId ?? undefined,
      stopId: this.sStopId ?? undefined,
      date: this.sDate || undefined
    }).subscribe({
      next: (data) => { this.list = data; this.loading = false; },
      error: () => { this.error = 'Erreur chargement schedule'; this.loading = false; }
    });
  }

  loadLine() {
    if (!this.sLineId) { this.error = 'LineId obligatoire'; return; }
    this.loading = true;
    this.scheduleService.getForLine(this.sLineId, this.sDate).subscribe({
      next: (data) => { this.list = data; this.loading = false; },
      error: () => { this.error = 'Erreur getForLine'; this.loading = false; }
    });
  }

  loadStop() {
    if (!this.sStopId) { this.error = 'StopId obligatoire'; return; }
    this.loading = true;
    this.scheduleService.getForStop(this.sStopId, this.sDate).subscribe({
      next: (data) => { this.list = data; this.loading = false; },
      error: () => { this.error = 'Erreur getForStop'; this.loading = false; }
    });
  }

  loadLineStop() {
    if (!this.sLineId || !this.sStopId) { this.error = 'LineId + StopId obligatoires'; return; }
    this.loading = true;
    this.scheduleService.getForLineAndStop(this.sLineId, this.sStopId, this.sDate).subscribe({
      next: (data) => { this.list = data; this.loading = false; },
      error: () => { this.error = 'Erreur line+stop'; this.loading = false; }
    });
  }

  nextDepartures() {
    this.error = null;
    if (!this.nLineId || !this.nStopId) { this.error = 'LineId + StopId obligatoires'; return; }

    this.scheduleService.nextDepartures(
      this.nLineId, this.nStopId, this.nDate, this.nFromTime, this.nLimit
    ).subscribe({
      next: (data) => this.nextList = data,
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
      tripCode: this.form.tripCode || null,
      plannedDepartureTime: this.form.plannedDepartureTime || null
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
      plannedArrivalTime: (row.plannedArrivalTime || '').slice(0,5),
      plannedDepartureTime: row.plannedDepartureTime ? row.plannedDepartureTime.slice(0,5) : '',
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
      stopId: 1,
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
}
