import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-incidents',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Incidents</h2>
    <p class="muted">Ici on va gérer /driver/incidents (liste, filtres, stats, update status, delete).</p>
  `,
  styles: [`.muted{color:#9fb3d1}`]
})
export class IncidentsComponent {}
