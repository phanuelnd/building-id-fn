import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login.component';
import { DashboardLayoutComponent } from './dashboard/dashboard-layout.component';
import { MapSearchComponent } from './public/map-search.component';
import { PublicMapViewComponent } from './public/public-map-view.component';
import { authGuard, adminGuard, superAdminGuard } from './guards/auth.guard';

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
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      {
        path: 'buildings',
        loadComponent: () => import('./dashboard/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
      },
      {
        path: '',
        redirectTo: 'buildings',
        pathMatch: 'full'
      }
    ]
  },

  {
    path: 'super-admin',
    canActivate: [superAdminGuard],
    children: [
      {
        path: 'users',
        loadComponent: () => import('./super-admin/users/users.component').then(m => m.UsersComponent)
      },
      {
        path: '',
        redirectTo: 'users',
        pathMatch: 'full'
      }
    ]
  },

  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent)
  },
  
  // First login password change (authenticated users only)
  {
    path: 'change-password',
    canActivate: [authGuard],
    loadComponent: () => import('./auth/change-password.component').then(m => m.ChangePasswordComponent)
  },
  
  // Error pages
  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  
  // Catch all - redirect to home
  {
    path: '**',
    redirectTo: '/'
  }
];
