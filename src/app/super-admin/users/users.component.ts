// src/app/super-admin/users/users.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService, User } from '../../services/auth.service';
import { environment } from '../../environments/environment';

interface CreateUserRequest {
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'super_admin';
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-200 p-8 mb-8 relative overflow-hidden">
          <!-- Background pattern -->
          <div class="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-indigo-600/5"></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-3xl font-bold text-white mb-2">User Management</h1>
                <p class="text-blue-100 text-lg">Manage system users and administrators</p>
              </div>
              <button
                (click)="showCreateForm = !showCreateForm"
                class="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold flex items-center space-x-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                <span>Add User</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Create User Form -->
        <div *ngIf="showCreateForm" class="bg-white rounded-2xl shadow-xl border border-blue-100 mb-8 overflow-hidden">
          <!-- Form Header -->
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-6">
            <h2 class="text-xl font-bold text-slate-800 flex items-center">
              <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              Create New User
            </h2>
          </div>

          <div class="p-6">
            <!-- Success/Error Messages -->
            <div *ngIf="createSuccessMessage" class="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl shadow-sm">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-emerald-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span class="text-emerald-700 font-medium">{{ createSuccessMessage }}</span>
              </div>
            </div>
            
            <div *ngIf="createErrorMessage" class="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl shadow-sm">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span class="text-red-700 font-medium">{{ createErrorMessage }}</span>
              </div>
            </div>

            <form (ngSubmit)="createUser()" #createForm="ngForm" class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-slate-700">Email Address</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                    </svg>
                  </div>
                  <input
                    type="email"
                    [(ngModel)]="newUser.email"
                    name="email"
                    required
                    email
                    class="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-slate-50 hover:bg-white"
                    placeholder="user@example.com"
                    [disabled]="isCreating"
                  >
                </div>
              </div>
              
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-slate-700">Role</label>
                <div class="relative">
                  <select
                    [(ngModel)]="newUser.role"
                    name="role"
                    required
                    class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-slate-50 hover:bg-white appearance-none"
                    [disabled]="isCreating"
                  >
                    <option value="admin">Administrator</option>
                    <option value="super_admin">Super Administrator</option>
                  </select>
                  <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-slate-700">First Name</label>
                <input
                  type="text"
                  [(ngModel)]="newUser.first_name"
                  name="first_name"
                  required
                  class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-slate-50 hover:bg-white"
                  placeholder="John"
                  [disabled]="isCreating"
                >
              </div>
              
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-slate-700">Last Name</label>
                <input
                  type="text"
                  [(ngModel)]="newUser.last_name"
                  name="last_name"
                  required
                  class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-slate-50 hover:bg-white"
                  placeholder="Doe"
                  [disabled]="isCreating"
                >
              </div>
              
              <div class="col-span-1 md:col-span-2 flex justify-end space-x-4 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  (click)="cancelCreate()"
                  class="px-6 py-3 text-slate-600 hover:text-slate-800 font-semibold rounded-xl hover:bg-slate-100 transition-all duration-200"
                  [disabled]="isCreating"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  [disabled]="createForm.invalid || isCreating"
                  class="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none font-semibold flex items-center space-x-2"
                >
                  <svg *ngIf="isCreating" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span *ngIf="!isCreating">Create User</span>
                  <span *ngIf="isCreating">Creating...</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Users List -->
        <div class="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
          <!-- Table Header -->
          <div class="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 p-6 border-b border-slate-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mr-4">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                  </svg>
                </div>
                <div>
                  <h2 class="text-xl font-bold text-white">All Users</h2>
                  <p class="text-blue-100 text-sm">{{ users.length }} total users</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Loading State -->
          <div *ngIf="isLoading" class="p-12 text-center">
            <div class="w-16 h-16 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg class="animate-spin h-8 w-8 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p class="text-xl font-semibold text-slate-700 mb-2">Loading users...</p>
            <p class="text-slate-500">Please wait while we fetch the user data</p>
          </div>

          <!-- Error State -->
          <div *ngIf="errorMessage && !isLoading" class="p-12 text-center">
            <div class="w-16 h-16 bg-gradient-to-tr from-red-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p class="text-xl font-semibold text-slate-700 mb-2">Unable to load users</p>
            <p class="text-slate-500 mb-6">{{ errorMessage }}</p>
            <button
              (click)="loadUsers()"
              class="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            >
              Try Again
            </button>
          </div>

          <!-- Users Table -->
          <div *ngIf="users.length > 0 && !isLoading" class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">User</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Role</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Last Login</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-slate-100">
                <tr *ngFor="let user of users" class="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group">
                  <td class="px-6 py-6 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="w-12 h-12 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg mr-4 group-hover:scale-105 transition-transform duration-200">
                        {{ user.first_name.charAt(0).toUpperCase() }}{{ user.last_name.charAt(0).toUpperCase() }}
                      </div>
                      <div>
                        <div class="text-sm font-bold text-slate-900">
                          {{ user.first_name }} {{ user.last_name }}
                        </div>
                        <div class="text-sm text-slate-500">{{ user.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-6 whitespace-nowrap">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm"
                          [ngClass]="{
                            'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300': user.role === 'super_admin',
                            'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300': user.role === 'admin'
                          }">
                      {{ user.role === 'super_admin' ? 'Super Admin' : 'Admin' }}
                    </span>
                  </td>
                  <td class="px-6 py-6 whitespace-nowrap">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm"
                          [ngClass]="{
                            'bg-gradient-to-r from-emerald-100 to-green-200 text-emerald-800 border border-emerald-300': user.status === 'active',
                            'bg-gradient-to-r from-yellow-100 to-amber-200 text-yellow-800 border border-yellow-300': user.status === 'pending',
                            'bg-gradient-to-r from-red-100 to-rose-200 text-red-800 border border-red-300': user.status === 'inactive'
                          }">
                      {{ user.status }}
                    </span>
                  </td>
                  <td class="px-6 py-6 whitespace-nowrap text-sm text-slate-600 font-medium">
                    {{ formatDate(user.last_login_at) }}
                  </td>
                  <td class="px-6 py-6 whitespace-nowrap text-sm text-slate-600 font-medium">
                    {{ formatDate(user.created_at) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div *ngIf="users.length === 0 && !isLoading && !errorMessage" class="p-12 text-center">
            <div class="w-16 h-16 bg-gradient-to-tr from-slate-400 to-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <p class="text-xl font-semibold text-slate-700 mb-2">No users found</p>
            <p class="text-slate-500">Start by creating your first user</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UsersComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  users: User[] = [];
  isLoading = false;
  errorMessage = '';
  
  showCreateForm = false;
  isCreating = false;
  createSuccessMessage = '';
  createErrorMessage = '';
  
  newUser: CreateUserRequest = {
    email: '',
    first_name: '',
    last_name: '',
    role: 'admin'
  };

  ngOnInit() {
    this.loadUsers();
  }

loadUsers() {
  this.isLoading = true;
  this.errorMessage = '';

  this.http.get<User[]>(`${environment.apiBaseUrl}/auth/users`).subscribe({
    next: (users) => {
      this.users = users;
      this.isLoading = false;
    },
    error: (error) => {
      this.isLoading = false;
      console.error('Failed to load users:', error);
      this.errorMessage = 'Failed to load users. Please try again.';
    }
  });
}

createUser() {
  this.isCreating = true;
  this.createErrorMessage = '';
  this.createSuccessMessage = '';

  this.http.post<User>(`${environment.apiBaseUrl}/auth/users`, this.newUser).subscribe({
    next: (user) => {
      this.isCreating = false;
      this.createSuccessMessage = `User ${user.first_name} ${user.last_name} created successfully!`;
      this.users.push(user);
      this.resetCreateForm();
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        this.createSuccessMessage = '';
      }, 3000);
    },
    error: (error) => {
      this.isCreating = false;
      console.error('Failed to create user:', error);
      
      if (error.error?.message) {
        this.createErrorMessage = error.error.message;
      } else {
        this.createErrorMessage = 'Failed to create user. Please try again.';
      }
    }
  });
}

  cancelCreate() {
    this.showCreateForm = false;
    this.resetCreateForm();
  }

  private resetCreateForm() {
    this.newUser = {
      email: '',
      first_name: '',
      last_name: '',
      role: 'admin'
    };
    this.createErrorMessage = '';
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'Never';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  }
}