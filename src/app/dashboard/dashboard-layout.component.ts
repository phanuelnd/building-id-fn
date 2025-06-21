import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { StatisticsCardsComponent, BuildingStats } from './statistics-cards.component';
import { LocationFiltersComponent } from './location-filters.component';
import { StatusMultiSelectComponent } from './status-multi-select.component';
import { SearchBarComponent } from './search-bar.component';
import { BuildingsTableComponent } from './buildings-table.component';
import { PaginationControlsComponent } from './pagination-controls.component';
import { ExportButtonComponent } from './export-button.component';
import { ToastNotificationsComponent, Toast } from './toast-notifications.component';
import { MapViewComponent, MapBounds } from './map-view.component';
import { Building } from '../models/building.model';
import { debounceTime, distinctUntilChanged, Subject, catchError, of } from 'rxjs';
import { BuildingDetailModalComponent } from './building-detail-modal.component';
import { SidebarNavigationComponent, NavigationView } from './sidebar-navigation.component';
import { AuthService, User } from '../services/auth.service';
import { environment } from '../environments/environment.development';

interface CreateUserRequest {
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'super_admin';
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatisticsCardsComponent,
    LocationFiltersComponent,
    StatusMultiSelectComponent,
    SearchBarComponent,
    BuildingsTableComponent,
    PaginationControlsComponent,
    ExportButtonComponent,
    ToastNotificationsComponent,
    BuildingDetailModalComponent,
    SidebarNavigationComponent,
    // MapViewComponent,
  ],
  template: `
    <div class="min-h-screen bg-blue-50 flex">
      <!-- Mobile Overlay -->
      <div 
        *ngIf="sidebarExpanded" 
        class="mobile-overlay fixed inset-0 bg-black bg-opacity-60 z-40 md:hidden"
        (click)="toggleSidebar()"
      ></div>

      <!-- Sidebar Navigation -->
      <app-sidebar-navigation
        [activeView]="currentView"
        [sidebarExpanded]="sidebarExpanded"
        (viewChange)="onViewChange($event)"
        (toggleSidebar)="toggleSidebar()"
      ></app-sidebar-navigation>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col">
        <!-- Header -->
        <header class="bg-gradient-to-b from-blue-50 via-white to-white shadow-md py-6" *ngIf="currentView !== 'logout'">
          <div class="w-full max-w-7xl mx-auto px-4">
            <h1 class="text-3xl md:text-4xl font-bold text-blue-500 tracking-tight mb-2">
              {{ getHeaderTitle() }}
            </h1>
            <p class="text-base md:text-lg text-gray-500 font-medium">
              {{ getHeaderSubtitle() }}
            </p>
          </div>
        </header>

        <!-- Content based on current view -->
        <main class="flex-1" [ngSwitch]="currentView">
          <!-- Dashboard View -->
          <div *ngSwitchCase="'dashboard'" class="w-full max-w-7xl mx-auto px-4 py-8">
            <app-statistics-cards
              [stats]="stats"
              (filterByStatus)="onStatusCardClick($event)"
            ></app-statistics-cards>
            <app-location-filters
              [provinces]="provinces"
              [districts]="districts"
              [sectors]="sectors"
              [province]="province"
              [district]="district"
              [sector]="sector"
              (provinceChange)="onProvinceChange($event)"
              (districtChange)="onDistrictChange($event)"
              (sectorChange)="onSectorChange($event)"
            ></app-location-filters>
            <app-status-multi-select
              [statuses]="statuses"
              [selectedStatuses]="selectedStatuses"
              (selectionChange)="onStatusChange($event)"
            ></app-status-multi-select>
            <app-search-bar
              [value]="search"
              (valueChange)="onSearchChange($event)"
            ></app-search-bar>
            <div class="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
              <app-export-button
                [loading]="exportLoading"
                (exportClick)="onExport()"
              ></app-export-button>
              <app-pagination-controls
                [page]="page"
                [totalPages]="totalPages"
                [pageSize]="pageSize"
                (pageChange)="onPageChange($event)"
                (pageSizeChange)="onPageSizeChange($event)"
              ></app-pagination-controls>
            </div>
            <app-buildings-table
              [buildings]="buildings"
              [columns]="columns"
              [loading]="loading"
              [error]="error"
              [sortBy]="sortBy"
              [sortDirection]="sortDirection"
              (sort)="onSort($event)"
              (viewDetail)="onViewDetail($event)"
            ></app-buildings-table>
          </div>

          <!-- Users Management View -->
          <div *ngSwitchCase="'users'" class="w-full max-w-7xl mx-auto px-4 py-8">
            <!-- Super Admin Only Content -->
            <div *ngIf="isCurrentUserSuperAdmin()">
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
              
              <!-- Loading State -->
              <div *ngIf="usersLoading" class="p-12 text-center">
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
              <div *ngIf="usersErrorMessage && !usersLoading" class="p-12 text-center">
                <div class="w-16 h-16 bg-gradient-to-tr from-red-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p class="text-xl font-semibold text-slate-700 mb-2">Unable to load users</p>
                <p class="text-slate-500 mb-6">{{ usersErrorMessage }}</p>
                <button
                  (click)="loadUsers()"
                  class="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                >
                  Try Again
                </button>
              </div>

              <!-- Users Table -->
              <div *ngIf="users.length > 0 && !usersLoading" class="overflow-x-auto">
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
              <div *ngIf="users.length === 0 && !usersLoading && !usersErrorMessage" class="p-12 text-center">
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
            
            <!-- Access Denied Message -->
            <div *ngIf="!isCurrentUserSuperAdmin()" class="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden p-12 text-center">
              <div class="w-16 h-16 bg-gradient-to-tr from-red-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>
              <p class="text-xl font-semibold text-slate-700 mb-2">Access Denied</p>
              <p class="text-slate-500">Only Super Administrators can access user management.</p>
            </div>
            </div>
          </div>




        </main>

        <!-- Footer (only show for dashboard and map views) -->
        <footer class="bg-white text-blue-400 text-center py-4 text-xs shadow-inner" *ngIf="currentView !== 'logout'">
          &copy; {{ currentYear }} Building Management. All rights reserved.
        </footer>
      </div>

      <!-- Toast Notifications (global) -->
      <app-toast-notifications
        [toasts]="toasts"
        (dismiss)="onDismissToast($event)"
      ></app-toast-notifications>

      <!-- Building Detail Modal -->
      <app-building-detail-modal
        *ngIf="selectedBuilding"
        [building]="selectedBuilding"
        (close)="selectedBuilding = null"
      ></app-building-detail-modal>
  `,
  styles: [`
    /* Enhanced mobile overlay */
    .mobile-overlay {
      backdrop-filter: blur(4px);
      transition: opacity 0.3s ease-in-out;
    }
  `]
})
export class DashboardLayoutComponent implements OnInit {
  private apiUrl = `${environment.apiBaseUrl}/buildings`;
  private searchSubject = new Subject<string>();
  public currentYear = new Date().getFullYear();

  // Navigation state
  currentView: NavigationView = 'dashboard';
  sidebarExpanded: boolean = true;

  // Component state
  stats: BuildingStats = { total: 0, byStatus: {} };
  provinces: string[] = [];
  districts: string[] = [];
  sectors: string[] = [];
  province = '';
  district = '';
  sector = '';
  statuses: string[] = [];
  selectedStatuses: string[] = [];
  search = '';
  buildings: Building[] = [];
  columns = [
    { key: 'id', label: 'ID' },
    { key: 'building_id', label: 'Building ID' },
    { key: 'status', label: 'Status' },
    { key: 'province', label: 'Province' },
    { key: 'district', label: 'District' },
    { key: 'sector', label: 'Sector' },
  ];
  loading = false;
  error: string | null = null;
  sortBy = 'id';
  sortDirection: 'ASC' | 'DESC' = 'ASC';
  page = 1;
  totalPages = 1;
  exportLoading = false;
  toasts: Toast[] = [];
  pageSize = 5;
  selectedBuilding: Building | null = null;

  // Users Management state
  users: User[] = [];
  usersLoading = false;
  usersErrorMessage = '';
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

  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.setupSearchDebounce();
  }

  ngOnInit() {
    this.loadInitialData();
  }

  // Navigation methods
  onViewChange(view: NavigationView) {
    if (view === 'logout') {
      // Immediate logout - redirect to login
      this.authService.logout();
      this.toasts.push({ message: 'Successfully logged out!', type: 'success' });
      this.router.navigate(['/login']);
      return;
    }
    
    this.currentView = view;
    if (view === 'dashboard') {
      // Reload dashboard data when switching back
      this.loadInitialData();
    } else if (view === 'users' && this.isCurrentUserSuperAdmin()) {
      // Load users data when switching to users view
      this.loadUsers();
    }
    // Auto-close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      this.sidebarExpanded = false;
    }
  }

  getHeaderTitle(): string {
    switch (this.currentView) {
      case 'dashboard':
        return 'Building ID Dashboard';
      case 'users':
        return 'User Management';
      default:
        return 'Building Management';
    }
  }

  getHeaderSubtitle(): string {
    switch (this.currentView) {
      case 'dashboard':
        return 'Welcome! Explore, search, and manage building data with ease.';
      case 'users':
        return 'Manage system users and administrators';
      default:
        return 'Building Management System';
    }
  }



  // Sidebar toggle method
  toggleSidebar() {
    this.sidebarExpanded = !this.sidebarExpanded;
  }

  private setupSearchDebounce() {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(searchTerm => {
        this.search = searchTerm;
        this.page = 1; // Reset to the first page for a new search
        this.handleSearch(searchTerm);
      });
  }

  private loadInitialData() {
    this.loading = true;
    this.error = null;

    Promise.all([
      this.loadStatistics(),
      this.loadProvinces(),
      this.loadBuildings() // Initial load of buildings
    ]).finally(() => {
      this.loading = false;
    });
  }

  private loadStatistics() {
    return this.http.get<BuildingStats>(`${this.apiUrl}/statistics`)
      .pipe(
        catchError(() => {
          this.showError('Failed to load statistics');
          return of({ total: 0, byStatus: {} });
        })
      )
      .subscribe(stats => {
        this.stats = stats;
        // Extract unique statuses from statistics
        this.statuses = Object.keys(stats.byStatus);
      });
  }

  private loadProvinces() {
    return this.http.get<string[]>(`${this.apiUrl}/provinces`)
      .pipe(
        catchError(() => {
          this.showError('Failed to load provinces');
          return of([]);
        })
      )
      .subscribe(provinces => {
        this.provinces = provinces;
      });
  }

  private loadDistricts() {
    const url = this.province 
      ? `${this.apiUrl}/districts?province=${encodeURIComponent(this.province)}`
      : `${this.apiUrl}/districts`;
    
    this.http.get<string[]>(url)
      .pipe(
        catchError(() => {
          this.showError('Failed to load districts');
          return of([]);
        })
      )
      .subscribe(districts => {
        this.districts = districts;
      });
  }

  private loadSectors() {
    const url = this.district
      ? `${this.apiUrl}/sectors?district=${encodeURIComponent(this.district)}`
      : `${this.apiUrl}/sectors`;
    
    this.http.get<string[]>(url)
      .pipe(
        catchError(() => {
          this.showError('Failed to load sectors');
          return of([]);
        })
      )
      .subscribe(sectors => {
        this.sectors = sectors;
      });
  }

  private handleSearch(searchTerm: string) {
    this.loading = true;
    this.error = null;

    if (searchTerm.trim() === '') {
      // If search term is empty, load all buildings with current filters
      this.loadBuildings();
      return;
    }

    // Attempt to search by exact building_id first
    this.http.get<Building>(`${this.apiUrl}/building_id/${searchTerm}`)
      .pipe(
        catchError((err) => {
          if (err.status === 404) {
            // If exact building_id not found, fall back to general search
            this.showError(`Building with ID "${searchTerm}" not found. Performing general search.`);
            return this.http.get<{ data: Building[], meta: { total: number, currentPage: number, totalPages: number } }>
              (`${this.apiUrl}?search=${encodeURIComponent(searchTerm)}&page=${this.page}&limit=${this.pageSize}`)
              .pipe(
                catchError(() => {
                  this.showError('Failed to load buildings with general search');
                  return of({ data: [], meta: { total: 0, currentPage: 1, totalPages: 1 } });
                })
              );
          } else {
            this.showError('Failed to load building details');
            return of(null);
          }
        })
      )
      .subscribe({
        next: (response) => {
          if (response && (response as Building).building_id) { // Check if it's a single Building object
            this.buildings = [response as Building];
            this.totalPages = 1;
            this.page = 1;
          } else if (response && (response as { data: Building[], meta: any }).data) { // Check if it's a paginated response
            const paginatedResponse = response as { data: Building[], meta: { total: number, currentPage: number, totalPages: number } };
            this.buildings = paginatedResponse.data;
            this.totalPages = paginatedResponse.meta.totalPages;
            this.page = paginatedResponse.meta.currentPage;
          } else {
            this.buildings = [];
            this.totalPages = 1;
            this.page = 1;
          }
        },
        error: () => {},
        complete: () => this.loading = false
      });
  }

  private loadBuildings() {
    this.loading = true;
    this.error = null;

    // Build query params as a plain object for Angular HttpClient
    const params: Record<string, string> = {
      page: this.page.toString(),
      limit: this.pageSize.toString(),
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
    };

    if (this.search) params['search'] = this.search;
    if (this.province) params['province'] = this.province;
    if (this.district) params['district'] = this.district;
    if (this.sector) params['sector'] = this.sector;
    if (this.selectedStatuses.length) params['statusFilter'] = this.selectedStatuses.join(',');

    this.http.get<{ data: Building[], meta: { total: number, currentPage: number, totalPages: number } }>
      (`${this.apiUrl}?${new URLSearchParams(params)}`)
      .pipe(
        catchError(() => {
          this.showError('Failed to load buildings');
          return of({ data: [], meta: { total: 0, currentPage: 1, totalPages: 1 } });
        })
      )
      .subscribe({
        next: (response) => {
          this.buildings = response.data;
          this.totalPages = Number(response.meta.totalPages);
          this.page = Number(response.meta.currentPage);
        },
        error: (err) => this.showError('Failed to load buildings'),
        complete: () => this.loading = false
      });
  }

  private showError(message: string) {
    this.error = message;
    this.toasts.push({ message, type: 'error' });
  }

  onStatusCardClick(status: string) {
    this.selectedStatuses = status === 'ALL' ? [] : [status];
    this.loadBuildings();
  }

  onProvinceChange(province: string) {
    this.province = province;
    this.district = '';
    this.sector = '';
    this.loadDistricts();
    this.loadBuildings();
  }

  onDistrictChange(district: string) {
    this.district = district;
    this.sector = '';
    this.loadSectors();
    this.loadBuildings();
  }

  onSectorChange(sector: string) {
    this.sector = sector;
    this.loadBuildings();
  }

  onStatusChange(statuses: string[]) {
    this.selectedStatuses = statuses;
    this.loadBuildings();
  }

  onSearchChange(term: string) {
    this.searchSubject.next(term);
  }

  onSort(column: string) {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.sortBy = column;
      this.sortDirection = 'ASC';
    }
    this.loadBuildings();
  }

  onPageChange(page: number) {
    this.page = Number(page);
    this.loadBuildings();
  }

  onPageSizeChange(newSize: number) {
    this.pageSize = Number(newSize);
    this.page = 1; // Reset to first page when changing page size
    this.loadBuildings();
  }

  onViewDetail(building: Building) {
    this.loading = true;
    this.error = null;
    this.http.get<Building>(`${this.apiUrl}/building_id/${building.building_id}`)
      .pipe(
        catchError(() => {
          this.showError('Failed to load building details');
          return of(null);
        })
      )
      .subscribe(data => {
        this.loading = false;
        if (data) {
          this.selectedBuilding = data;          
        } else {
          this.showError('Building details not found.');
        }
      });
  }

  onExport() {
    this.exportLoading = true;
    this.http.get(`${this.apiUrl}/export`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'buildings.geojson';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.toasts.push({ message: 'GeoJSON exported successfully!', type: 'success' });
      },
      error: (err) => this.showError('Failed to export GeoJSON'),
      complete: () => this.exportLoading = false
    });
  }

  onDismissToast(index: number) {
    this.toasts.splice(index, 1);
  }

  onSelectBuilding(building: Building) {
    this.toasts.push({ message: `Map selected building ${building.building_id}`, type: 'info' });
  }

  onMapBoundsChange(bounds: MapBounds) {
    // TODO: Implement map bounds change handling
    console.log('Map bounds changed:', bounds);
  }

  // Users Management methods
  isCurrentUserSuperAdmin(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.role === 'super_admin';
  }

  loadUsers() {
    if (this.currentView !== 'users') return;
    
    this.usersLoading = true;
    this.usersErrorMessage = '';

    this.http.get<User[]>(`${environment.apiBaseUrl}/auth/users`).subscribe({
      next: (users) => {
        this.users = users;
        this.usersLoading = false;
      },
      error: (error) => {
        this.usersLoading = false;
        console.error('Failed to load users:', error);
        this.usersErrorMessage = 'Failed to load users. Please try again.';
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
