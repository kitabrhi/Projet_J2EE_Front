import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../services/alert.service';
import { Alert } from '../../models/alert.model';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.css']
})
export class AlertsComponent implements OnInit {
  loading = false;
  error: string | null = null;
  
  alerts: Alert[] = [];
  recent: Alert[] = [];
  
  statsStatus: Record<string, number> = {};
  statsSeverity: Record<string, number> = {};
  
  // Filters
  status = '';
  severity = '';
  vehicleId: number | null = null;
  lineId: number | null = null;
  stopId: number | null = null;
  fromDate = '';
  toDate = '';

  constructor(private alertService: AlertService) {}

  ngOnInit(): void {
    this.refreshAll();
  }

  refreshAll() {
    this.loadStats();
    this.loadRecent();
    this.search();
  }

  loadStats() {
    this.alertService.statsByStatus().subscribe({
      next: (res) => (this.statsStatus = res || {}),
      error: () => (this.statsStatus = {})
    });
    
    this.alertService.statsBySeverity().subscribe({
      next: (res) => (this.statsSeverity = res || {}),
      error: () => (this.statsSeverity = {})
    });
  }

  loadRecent() {
    this.alertService.getRecent(10).subscribe({
      next: (res) => (this.recent = res || []),
      error: () => (this.recent = [])
    });
  }

  openOnly() {
    this.loading = true;
    this.error = null;
    
    this.alertService.getOpen().subscribe({
      next: (res) => {
        this.alerts = res || [];
        this.loading = false;
      },
      error: () => {
        this.error = "Impossible de charger les alertes OPEN.";
        this.loading = false;
      }
    });
  }

  search() {
    this.loading = true;
    this.error = null;
    
    this.alertService.search({
      status: this.status || undefined,
      severity: this.severity || undefined,
      vehicleId: this.vehicleId ?? undefined,
      lineId: this.lineId ?? undefined,
      stopId: this.stopId ?? undefined,
      fromDate: this.fromDate || undefined,
      toDate: this.toDate || undefined
    }).subscribe({
      next: (res) => {
        this.alerts = res || [];
        this.loading = false;
      },
      error: () => {
        this.error = "Erreur lors de la recherche des alertes.";
        this.loading = false;
      }
    });
  }

  clearFilters() {
    this.status = '';
    this.severity = '';
    this.vehicleId = null;
    this.lineId = null;
    this.stopId = null;
    this.fromDate = '';
    this.toDate = '';
    this.search();
  }

  setStatus(a: Alert, newStatus: string) {
    if (!newStatus) return;
    
    this.alertService.updateStatus(a.id, newStatus).subscribe({
      next: (updated) => {
        this.alerts = this.alerts.map(x => x.id === updated.id ? updated : x);
        this.loadStats();
        this.loadRecent();
      },
      error: () => alert("Échec de la mise à jour du statut.")
    });
  }

  deleteAlert(a: Alert) {
    const ok = confirm(`Supprimer l'alerte #${a.id} ?`);
    if (!ok) return;
    
    this.alertService.delete(a.id).subscribe({
      next: () => {
        this.alerts = this.alerts.filter(x => x.id !== a.id);
        this.loadStats();
        this.loadRecent();
      },
      error: () => alert("Échec de la suppression.")
    });
  }

  // ==========================================
  // MÉTHODES HELPER POUR L'UI
  // ==========================================

  /**
   * Retourne la classe CSS pour le badge de sévérité
   */
  badgeClassSeverity(sev?: string | null): string {
    switch ((sev || '').toUpperCase()) {
      case 'CRITICAL': return 'badge critical';
      case 'WARNING': return 'badge warning';
      default: return 'badge info';
    }
  }

  /**
   * Retourne la classe CSS pour le badge de statut
   */
  badgeClassStatus(st?: string | null): string {
    switch ((st || '').toUpperCase()) {
      case 'OPEN': return 'pill open';
      case 'IN_PROGRESS': return 'pill progress';
      case 'RESOLVED':
      case 'CLOSED': return 'pill closed';
      default: return 'pill';
    }
  }

  /**
   * Retourne la classe CSS pour la sévérité (pour ngClass)
   */
  getSeverityClass(severity: string): string {
    return severity.toLowerCase();
  }

  /**
   * Retourne la classe CSS pour l'icône de statut
   */
  getStatusIconClass(status: string): string {
    switch (status.toUpperCase()) {
      case 'OPEN': return 'open';
      case 'IN_PROGRESS': return 'progress';
      case 'RESOLVED': return 'resolved';
      case 'CLOSED': return 'closed';
      default: return '';
    }
  }

  /**
   * Retourne l'icône emoji pour le statut
   */
  getStatusIcon(status: string): string {
    switch (status.toUpperCase()) {
      case 'OPEN': return '🔵';
      case 'IN_PROGRESS': return '🟡';
      case 'RESOLVED': return '🟢';
      case 'CLOSED': return '⚫';
      default: return '⚪';
    }
  }

  /**
   * Retourne l'icône emoji pour la sévérité
   */
  getSeverityIcon(severity?: string | null): string {
    switch ((severity || '').toUpperCase()) {
      case 'CRITICAL': return '🔴';
      case 'WARNING': return '⚠️';
      case 'INFO': return 'ℹ️';
      default: return '⚪';
    }
  }

  /**
   * Calcule le pourcentage d'une valeur par rapport au total
   */
  getPercentage(value: number, stats: Record<string, number>): number {
    const total = Object.values(stats).reduce((sum, val) => sum + val, 0);
    return total > 0 ? (value / total) * 100 : 0;
  }

  /**
   * Formate une date au format français
   */
  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  }

  /**
   * Formate l'heure au format français
   */
  formatTime(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  }
}