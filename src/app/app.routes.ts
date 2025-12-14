import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

import { VehiclesComponent } from './pages/vehicles/vehicles.component';
import { AlertsComponent } from './pages/alerts/alerts.component';
import { IncidentsComponent } from './pages/incidents/incidents.component';
import { PlanningComponent } from './pages/planning/planning.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'vehicles' },
      { path: 'vehicles', component: VehiclesComponent },
      { path: 'alerts', component: AlertsComponent },
      { path: 'incidents', component: IncidentsComponent },
      { path: 'planning', component: PlanningComponent },
    ]
  },

  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' }
];
