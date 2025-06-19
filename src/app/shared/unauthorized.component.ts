// src/app/shared/unauthorized.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <!-- Error Icon -->
        <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        <!-- Title -->
        <h1 class="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        
        <!-- Message -->
        <p class="text-gray-600 mb-8">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>

        <!-- User Info -->
        <div *ngIf="currentUser" class="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <p class="text-sm text-gray-600 mb-1">Logged in as:</p>
          <p class="font-medium text-gray-900">{{ currentUser.first_name }} {{ currentUser.last_name }}</p>
          <p class="text-sm text-gray-600">{{ currentUser.email }}</p>
          <p class="text-sm">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  [ngClass]="{
                    'bg-purple-100 text-purple-800': currentUser.role === 'super_admin',
                    'bg-blue-100 text-blue-800': currentUser.role === 'admin'
                  }">
              {{ currentUser.role === 'super_admin' ? 'Super Admin' : 'Admin' }}
            </span>
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3">
          <button
            (click)="goToDashboard()"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Go to Dashboard
          </button>
          
          <button
            (click)="goBack()"
            class="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-200"
          >
            Go Back
          </button>
          
          <button
            (click)="logout()"
            class="w-full text-red-600 py-2 px-4 rounded-lg hover:bg-red-50 transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  `
})
export class UnauthorizedComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  currentUser = this.authService.getCurrentUser();

  goToDashboard(): void {
    this.router.navigate(['/admin/buildings']);
  }

  goBack(): void {
    window.history.back();
  }

  logout(): void {
    this.authService.logout();
  }
}