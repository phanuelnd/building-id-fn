// src/app/profile/profile.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-4">
      <div class="max-w-2xl mx-auto">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Profile Settings</h1>
              <p class="text-gray-600 mt-1">Manage your account information</p>
            </div>
            <button
              (click)="goBack()"
              class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        <!-- Profile Form -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <!-- Success Message -->
          <div *ngIf="successMessage" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-sm text-green-700">{{ successMessage }}</span>
            </div>
          </div>

          <!-- Error Message -->
          <div *ngIf="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-sm text-red-700">{{ errorMessage }}</span>
            </div>
          </div>

          <form (ngSubmit)="updateProfile()" #profileForm="ngForm" class="space-y-6">
            <!-- User Info Display -->
            <div class="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 class="font-medium text-gray-900 mb-3">Account Information</h3>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-600">Email:</span>
                  <p class="font-medium">{{ currentUser?.email }}</p>
                </div>
                <div>
                  <span class="text-gray-600">Role:</span>
                  <p class="font-medium">{{ getRoleDisplay(currentUser?.role) }}</p>
                </div>
                <div>
                  <span class="text-gray-600">Status:</span>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [ngClass]="{
                          'bg-green-100 text-green-800': currentUser?.status === 'active',
                          'bg-yellow-100 text-yellow-800': currentUser?.status === 'pending',
                          'bg-red-100 text-red-800': currentUser?.status === 'inactive'
                        }">
                    {{ currentUser?.status }}
                  </span>
                </div>
                <div>
                  <span class="text-gray-600">Last Login:</span>
                  <p class="font-medium">{{ formatDate(currentUser?.last_login_at) }}</p>
                </div>
              </div>
            </div>

            <!-- Editable Fields -->
            <div class="grid grid-cols-2 gap-6">
              <!-- First Name -->
              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  [(ngModel)]="firstName"
                  required
                  #firstNameInput="ngModel"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  [disabled]="isLoading"
                >
                <div *ngIf="firstNameInput.invalid && firstNameInput.touched" class="mt-1 text-sm text-red-600">
                  First name is required
                </div>
              </div>

              <!-- Last Name -->
              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  [(ngModel)]="lastName"
                  required
                  #lastNameInput="ngModel"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  [disabled]="isLoading"
                >
                <div *ngIf="lastNameInput.invalid && lastNameInput.touched" class="mt-1 text-sm text-red-600">
                  Last name is required
                </div>
              </div>
            </div>

            <!-- Update Profile Button -->
            <div class="flex justify-end">
              <button
                type="submit"
                [disabled]="profileForm.invalid || isLoading || !hasChanges()"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span *ngIf="!isLoading">Update Profile</span>
                <span *ngIf="isLoading" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </span>
              </button>
            </div>
          </form>

          <!-- Change Password Section -->
          <div class="mt-8 pt-6 border-t border-gray-200">
            <h3 class="font-medium text-gray-900 mb-3">Security</h3>
            <button
              (click)="changePassword()"
              class="px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser: User | null = null;
  firstName = '';
  lastName = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.firstName = this.currentUser.first_name;
      this.lastName = this.currentUser.last_name;
    }
  }

  updateProfile() {
    if (!this.hasChanges()) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const updateData = {
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim()
    };

    this.authService.updateProfile(updateData).subscribe({
      next: (user) => {
        this.isLoading = false;
        this.successMessage = 'Profile updated successfully!';
        this.currentUser = user;
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Profile update failed:', error);
        
        if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Failed to update profile. Please try again.';
        }
      }
    });
  }

  changePassword() {
    this.router.navigate(['/change-password']);
  }

  goBack() {
    this.router.navigate(['/admin/buildings']);
  }

  hasChanges(): boolean {
    if (!this.currentUser) return false;
    
    return this.firstName.trim() !== this.currentUser.first_name ||
           this.lastName.trim() !== this.currentUser.last_name;
  }

  getRoleDisplay(role?: string): string {
    switch (role) {
      case 'super_admin': return 'Super Administrator';
      case 'admin': return 'Administrator';
      default: return 'User';
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'Never';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  }
}