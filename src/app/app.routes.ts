import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login.component';
import { DashboardLayoutComponent } from './dashboard/dashboard-layout.component';
import { MapSearchComponent } from './public/map-search.component';
import { PublicMapViewComponent } from './public/public-map-view.component';

export const routes: Routes = [
  {
    path: '',
    component: MapSearchComponent
  },
  {
    path: 'map/:query',
    component: PublicMapViewComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent
  },
  {
    path: '**',
    redirectTo: '/'
  }
];
