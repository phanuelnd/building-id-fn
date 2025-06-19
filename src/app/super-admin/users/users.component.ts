// src/app/super-admin/users/users.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService, User } from '../../services/auth.service';

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
    <div class="min-h-screen bg-gray-50 p-4">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">User Management</h1>
              <p class="text-gray-600 mt-1">Manage system users and administrators</p>
            </div>
            <button
              (click)="showCreateForm = !showCreateForm"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Add User
            </button>
          </div>
        </div>

        <!-- Create User Form -->
        <div *ngIf="showCreateForm" class="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Create New User</h2>
          
          <!-- Success/Error Messages -->
          <div *ngIf="createSuccessMessage" class="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <span class="text-sm text-green-700">{{ createSuccessMessage }}</span>
          </div>
          
          <div *ngIf="createErrorMessage" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <span class="text-sm text-red-700">{{ createErrorMessage }}</span>
          </div>

          <form (ngSubmit)="createUser()" #createForm="ngForm" class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                [(ngModel)]="newUser.email"
                name="email"
                required
                email
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                [disabled]="isCreating"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                [(ngModel)]="newUser.role"
                name="role"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                [disabled]="isCreating"
              >
                <option value="admin">Administrator</option>
                <option value="super_admin">Super Administrator</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                [(ngModel)]="newUser.first_name"
                name="first_name"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                [disabled]="isCreating"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                [(ngModel)]="newUser.last_name"
                name="last_name"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                [disabled]="isCreating"
              >
            </div>
            
            <div class="col-span-2 flex justify-end space-x-3">
              <button
                type="button"
                (click)="cancelCreate()"
                class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                [disabled]="isCreating"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="createForm.invalid || isCreating"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <span *ngIf="!isCreating">Create User</span>
                <span *ngIf="isCreating">Creating...</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Users List -->
        <div class="bg-white rounded-lg shadow-sm border">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">All Users</h2>
          </div>
          
          <!-- Loading State -->
          <div *ngIf="isLoading" class="p-8 text-center">
            <svg class="animate-spin h-8 w-8 mx-auto text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="mt-2 text-gray-600">Loading users...</p>
          </div>

          <!-- Error State -->
          <div *ngIf="errorMessage && !isLoading" class="p-8 text-center">
            <div class="text-red-600 mb-4">
              <svg class="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p class="text-gray-600">{{ errorMessage }}</p>
            <button
              (click)="loadUsers()"
              class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>

          <!-- Users Table -->
          <div *ngIf="users.length > 0 && !isLoading" class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let user of users" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div class="text-sm font-medium text-gray-900">
                        {{ user.first_name }} {{ user.last_name }}
                      </div>
                      <div class="text-sm text-gray-500">{{ user.email }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          [ngClass]="{
                            'bg-purple-100 text-purple-800': user.role === 'super_admin',
                            'bg-blue-100 text-blue-800': user.role === 'admin'
                          }">
                      {{ user.role === 'super_admin' ? 'Super Admin' : 'Admin' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          [ngClass]="{
                            'bg-green-100 text-green-800': user.status === 'active',
                            'bg-yellow-100 text-yellow-800': user.status === 'pending',
                            'bg-red-100 text-red-800': user.status === 'inactive'
                          }">
                      {{ user.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(user.last_login_at) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(user.created_at) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div *ngIf="users.length === 0 && !isLoading && !errorMessage" class="p-8 text-center">
            <svg class="h-8 w-8 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <p class="mt-2 text-gray-600">No users found</p>
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

    this.http.get<User[]>('http://localhost:3000/api/auth/users').subscribe({
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

    this.http.post<User>('http://localhost:3000/api/auth/users', this.newUser).subscribe({
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