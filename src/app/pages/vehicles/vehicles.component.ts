import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  VehicleService,
  VehicleResponse,
  VehicleCreateRequest,
  UpdatePositionRequest
} from '../../services/vehicles.service';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.css']
})
export class VehiclesComponent {
  vehicles: VehicleResponse[] = [];
  selected: VehicleResponse | null = null;

  loading = false;
  error: string | null = null;
  success: string | null = null;

  // ======= FILTER =======
  filterLineId: number | null = null;

  // ======= CREATE FORM =======
  newCode = '';
  newLineId: number | null = null;
  newDriverId: number | null = null;

  // ======= UPDATE POSITION FORM =======
  posVehicleId: number | null = null;
  posLatitude: number | null = null;
  posLongitude: number | null = null;
  posSpeed: number | null = null;
  posHeading: number | null = null;

  constructor(private vehicleService: VehicleService) {}

  ngOnInit() {
    this.loadVehicles();
  }

  private resetMessages() {
    this.error = null;
    this.success = null;
  }

  // GET /vehicles
  loadVehicles() {
    this.resetMessages();
    this.loading = true;

    this.vehicleService.getAll(this.filterLineId ?? undefined).subscribe({
      next: (data) => {
        this.vehicles = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erreur chargement véhicules.';
        this.loading = false;
      }
    });
  }

  // GET /vehicles/{id}
  viewDetails(id: number) {
    this.resetMessages();
    this.selected = null;

    this.vehicleService.getById(id).subscribe({
      next: (v) => (this.selected = v),
      error: (err) => {
        console.error(err);
        this.error = 'Impossible de charger les détails du véhicule.';
      }
    });
  }

  clearDetails() {
    this.selected = null;
  }

  // POST /vehicles
  createVehicle() {
    this.resetMessages();

    if (!this.newCode.trim()) {
      this.error = 'Le champ "code" est obligatoire (ex: BUS_104).';
      return;
    }

    const payload: VehicleCreateRequest = {
      code: this.newCode.trim(),
      lineId: this.newLineId ?? undefined,
      driverId: this.newDriverId ?? undefined
    };

    this.vehicleService.create(payload).subscribe({
      next: (created) => {
        this.success = `Véhicule créé: ${created.code} (id=${created.id})`;
        this.newCode = '';
        this.newLineId = null;
        this.newDriverId = null;
        this.loadVehicles();
      },
      error: (err) => {
        console.error(err);
        // ton backend peut renvoyer "Code véhicule déjà utilisé"
        this.error = err?.error?.message || 'Erreur création véhicule.';
      }
    });
  }

  // PUT /vehicles/{id}/position
  updatePosition() {
    this.resetMessages();

    if (!this.posVehicleId) {
      this.error = 'Vehicle ID obligatoire pour modifier la position.';
      return;
    }
    if (this.posLatitude == null || this.posLongitude == null) {
      this.error = 'Latitude et Longitude obligatoires.';
      return;
    }

    const payload: UpdatePositionRequest = {
      latitude: this.posLatitude,
      longitude: this.posLongitude,
      speed: this.posSpeed ?? undefined,
      heading: this.posHeading ?? undefined
    };

    this.vehicleService.updatePosition(this.posVehicleId, payload).subscribe({
      next: (updated) => {
        this.success = `Position mise à jour pour ${updated.code} (id=${updated.id}).`;
        // refresh list + details if same
        this.loadVehicles();
        if (this.selected?.id === updated.id) {
          this.selected = updated;
        }
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erreur mise à jour position.';
      }
    });
  }

  // Helper: remplir form position depuis un véhicule
  fillPositionFromVehicle(v: VehicleResponse) {
    this.posVehicleId = v.id;
    this.posLatitude = v.latitude ?? null;
    this.posLongitude = v.longitude ?? null;
    this.posSpeed = v.speed ?? null;
    this.posHeading = v.heading ?? null;
    this.success = `Form position pré-rempli avec ${v.code} (id=${v.id}).`;
    this.error = null;
  }
}
