// src/app/auth/change-password.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <div class="w-full max-w-md">
        <div class="bg-white rounded-2xl shadow-xl border border-blue-100 p-8">
          <!-- Header -->
          <div class="mb-8 text-center">
            <div class="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">Set New Password</h2>
            <p class="text-gray-600">Please set a new password for your account</p>
          </div>

          <!-- Error Message -->
          <div *ngIf="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-sm text-red-700">{{ errorMessage }}</span>
            </div>
          </div>

          <!-- Success Message -->
          <div *ngIf="successMessage" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-sm text-green-700">{{ successMessage }}</span>
            </div>
          </div>

          <form (ngSubmit)="onChangePassword()" #passwordForm="ngForm" class="space-y-6">
            <!-- Current Password Field -->
            <div>
              <label for="currentPassword" class="block text-sm font-semibold text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                [(ngModel)]="currentPassword"
                required
                #currentPasswordInput="ngModel"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-gray-50 focus:bg-white"
                placeholder="Enter your current password"
                [class.border-red-500]="currentPasswordInput.invalid && currentPasswordInput.touched"
                [disabled]="isLoading"
              >
              <div *ngIf="currentPasswordInput.invalid && currentPasswordInput.touched" class="mt-1 text-sm text-red-600">
                <span *ngIf="currentPasswordInput.errors?.['required']">Current password is required</span>
              </div>
            </div>

            <!-- New Password Field -->
            <div>
              <label for="newPassword" class="block text-sm font-semibold text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                [(ngModel)]="newPassword"
                required
                minlength="8"
                #newPasswordInput="ngModel"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-gray-50 focus:bg-white"
                placeholder="Enter your new password"
                [class.border-red-500]="newPasswordInput.invalid && newPasswordInput.touched"
                [disabled]="isLoading"
              >
              <div *ngIf="newPasswordInput.invalid && newPasswordInput.touched" class="mt-1 text-sm text-red-600">
                <span *ngIf="newPasswordInput.errors?.['required']">New password is required</span>
                <span *ngIf="newPasswordInput.errors?.['minlength']">Password must be at least 8 characters</span>
              </div>
              <div class="mt-1 text-sm text-gray-600">
                Password should be at least 8 characters long and include letters, numbers, and special characters.
              </div>
            </div>

            <!-- Confirm Password Field -->
            <div>
              <label for="confirmPassword" class="block text-sm font-semibold text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                [(ngModel)]="confirmPassword"
                required
                #confirmPasswordInput="ngModel"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-gray-50 focus:bg-white"
                placeholder="Confirm your new password"
                [class.border-red-500]="(confirmPasswordInput.invalid && confirmPasswordInput.touched) || (confirmPassword && newPassword !== confirmPassword)"
                [disabled]="isLoading"
              >
              <div *ngIf="confirmPasswordInput.invalid && confirmPasswordInput.touched" class="mt-1 text-sm text-red-600">
                <span *ngIf="confirmPasswordInput.errors?.['required']">Please confirm your password</span>
              </div>
              <div *ngIf="confirmPassword && newPassword !== confirmPassword" class="mt-1 text-sm text-red-600">
                Passwords do not match
              </div>
            </div>

            <!-- Change Password Button -->
            <button
              type="submit"
              [disabled]="passwordForm.invalid || isLoading || newPassword !== confirmPassword"
              class="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span *ngIf="!isLoading" class="flex items-center justify-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Change Password
              </span>
              <span *ngIf="isLoading" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ChangePasswordComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit() {
    // Check if user really needs to change password
    const user = this.authService.getCurrentUser();
    if (!user?.is_first_login) {
      this.router.navigate(['/admin/buildings']);
    }
  }

  onChangePassword(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (this.newPassword.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters long';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const updateData = {
      password: this.newPassword,
      currentPassword: this.currentPassword
    };

    this.authService.updateProfile(updateData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Password updated successfully! Redirecting to dashboard...';
        
        setTimeout(() => {
          this.router.navigate(['/admin/buildings']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Password change failed:', error);
        
        if (error.status === 401) {
          this.errorMessage = 'Current password is incorrect.';
        } else if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Failed to update password. Please try again.';
        }
      }
    });
  }
}