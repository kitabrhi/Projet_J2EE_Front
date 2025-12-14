import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Planification</h2>
    <p class="muted">Ici on va gérer /schedule (CRUD + search + next departures).</p>
  `,
  styles: [`.muted{color:#9fb3d1}`]
})
export class PlanningComponent {}
