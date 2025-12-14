import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncidentService } from '../../services/incident.service';
import { Incident } from '../../models/incident.model';

@Component({
  selector: 'app-incidents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './incidents.component.html',
  styleUrls: ['./incidents.component.css']
})
export class IncidentsComponent implements OnInit {

  loading = false;
  error: string | null = null;

  incidents: Incident[] = [];
  stats: Record<string, number> = {};

  // filtres (search)
  fStatus = '';
  fSeverity = '';
  fVehicleId: number | null = null;
  fLineId: number | null = null;
  fReportedBy = '';
  fLimit = 10;

  // create form
  form: Incident = {
    type: 'ACCIDENT',
    severity: 'LOW',
    description: '',
    vehicleId: null,
    lineId: null,
    stopId: null,
    tripId: null,
    reportedBy: ''
  };

  constructor(private incidentService: IncidentService) {}

  ngOnInit(): void {
    this.refresh();
    this.loadStats();
  }

  refresh() {
    this.loading = true;
    this.error = null;

    this.incidentService.search({}).subscribe({
      next: (data) => {
        this.incidents = data;
        this.loading = false;
      },
      error: (e) => {
        this.error = 'Erreur lors du chargement des incidents';
        this.loading = false;
      }
    });
  }

  loadStats() {
    this.incidentService.statsByStatus().subscribe({
      next: (s) => this.stats = s,
      error: () => {}
    });
  }

  search() {
    this.loading = true;
    this.error = null;

    this.incidentService.search({
      status: this.fStatus || undefined,
      severity: this.fSeverity || undefined,
      vehicleId: this.fVehicleId ?? undefined,
      lineId: this.fLineId ?? undefined,
      reportedBy: this.fReportedBy || undefined,
    }).subscribe({
      next: (data) => {
        this.incidents = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Recherche échouée';
        this.loading = false;
      }
    });
  }

  openOnly() {
    this.loading = true;
    this.incidentService.getOpen().subscribe({
      next: (data) => { this.incidents = data; this.loading = false; },
      error: () => { this.error = 'Erreur open incidents'; this.loading = false; }
    });
  }

  recent() {
    this.loading = true;
    this.incidentService.recent(this.fLimit || 10).subscribe({
      next: (data) => { this.incidents = data; this.loading = false; },
      error: () => { this.error = 'Erreur recent'; this.loading = false; }
    });
  }

  create() {
    this.error = null;

    if (!this.form.type || !this.form.severity) {
      this.error = 'Type et severity sont obligatoires';
      return;
    }

    this.incidentService.create(this.form).subscribe({
      next: () => {
        this.form = { type: 'ACCIDENT', severity: 'LOW', description: '', vehicleId: null, lineId: null, stopId: null, tripId: null, reportedBy: '' };
        this.refresh();
        this.loadStats();
      },
      error: () => this.error = 'Création incident échouée'
    });
  }

  changeStatus(inc: Incident, newStatus: string) {
    if (!inc.id) return;
    this.incidentService.updateStatus(inc.id, newStatus).subscribe({
      next: (updated) => {
        inc.status = updated.status;
        this.loadStats();
      },
      error: () => this.error = 'Update status échoué (vérifie enum côté backend)'
    });
  }

  remove(inc: Incident) {
    if (!inc.id) return;
    this.incidentService.delete(inc.id).subscribe({
      next: () => {
        this.incidents = this.incidents.filter(x => x.id !== inc.id);
        this.loadStats();
      },
      error: () => this.error = 'Suppression échouée'
    });
  }

  keys(obj: Record<string, number>) {
    return Object.keys(obj);
  }
}
