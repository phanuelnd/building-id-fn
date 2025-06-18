import { Component, Output, EventEmitter, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../services/auth.service';

export type NavigationView = 'dashboard' | 'map' | 'logout';

@Component({
  selector: 'app-sidebar-navigation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="w-64 bg-white shadow-lg h-full flex flex-col">
      <!-- Logo/Header -->
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-xl font-bold text-blue-700">Building Manager</h2>
            <p class="text-sm text-gray-500 mt-1">Navigation</p>
          </div>
          <!-- Close/Toggle Button -->
          <button
            (click)="onToggleSidebar()"
            class="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            [attr.aria-label]="'Close sidebar'"
          >
            <!-- Close Icon -->
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <!-- User Info -->
        <div *ngIf="currentUser" class="p-3 bg-blue-50 rounded-lg">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {{ currentUser.username.charAt(0).toUpperCase() }}
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-blue-900">{{ currentUser.username }}</p>
              <p class="text-xs text-blue-600">{{ currentUser.role }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="flex-1 p-4">
        <ul class="space-y-2">
          <li>
            <button
              (click)="onNavigate('dashboard')"
              [class]="getButtonClass('dashboard')"
              class="w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200"
            >
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span class="font-medium">Building Dashboard</span>
            </button>
          </li>
          <li>
            <button
              (click)="onNavigate('map')"
              [class]="getButtonClass('map')"
              class="w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200"
            >
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span class="font-medium">View Building on Map</span>
            </button>
          </li>
          <li>
            <button
              (click)="onNavigate('logout')"
              [class]="getButtonClass('logout') + ' text-red-600 hover:bg-red-50 hover:text-red-700'"
              class="w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200 mt-20"
            >
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span class="font-medium">Logout</span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  `,
})
export class SidebarNavigationComponent implements OnInit {
  @Input() activeView: NavigationView = 'dashboard';
  @Input() sidebarVisible: boolean = true;
  @Output() viewChange = new EventEmitter<NavigationView>();
  @Output() toggleSidebar = new EventEmitter<void>();

  private authService = inject(AuthService);
  currentUser: User | null = null;

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
  }

  onNavigate(view: NavigationView) {
    this.viewChange.emit(view);
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  getButtonClass(view: NavigationView): string {
    const baseClass = 'w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200';
    const activeClass = 'bg-blue-100 text-blue-700 border border-blue-200';
    const inactiveClass = 'text-gray-600 hover:bg-gray-50 hover:text-gray-900';
    // Special styling for logout button
    if (view === 'logout') {
      return this.activeView === view
        ? activeClass + ' text-red-700 border-red-200 bg-red-100'
        : 'text-red-600 hover:bg-red-50 hover:text-red-700';
    }
    return this.activeView === view ? activeClass : inactiveClass;
  }
} 