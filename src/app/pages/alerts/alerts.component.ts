import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Alertes</h2>
    <p class="muted">Ici on va gérer /driver/alerts (recherche, stats, update status, delete).</p>
  `,
  styles: [`.muted{color:#9fb3d1}`]
})
export class AlertsComponent {}
