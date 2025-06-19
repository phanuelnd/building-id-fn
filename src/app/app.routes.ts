import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login.component';
import { DashboardLayoutComponent } from './dashboard/dashboard-layout.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
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
    redirectTo: '/dashboard'
  }
];
