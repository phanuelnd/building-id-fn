import { Component, Output, EventEmitter, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../services/auth.service';

export type NavigationView = 'dashboard' | 'map' | 'logout';

@Component({
  selector: 'app-sidebar-navigation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside [class]="getSidebarClasses()">
      <!-- Expanded Sidebar -->
      <div *ngIf="sidebarExpanded" class="w-full h-full flex flex-col">
        <!-- Logo/Header -->
        <div class="p-8 border-b border-gray-100 bg-gradient-to-r from-slate-700 to-slate-800">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-2xl font-bold text-white">Mininfra</h2>
              <p class="text-blue-100 mt-1">Building Management</p>
            </div>
            <!-- Hamburger Toggle Button -->
            <button
              (click)="onToggleSidebar()"
              class="p-3 rounded-xl hover:bg-white hover:bg-opacity-15 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-30 group"
              [attr.aria-label]="'Toggle sidebar'"
            >
              <!-- Hamburger Icon -->
              <svg class="w-6 h-6 text-white group-hover:scale-105 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          <!-- User Info -->
          <div
            *ngIf="currentUser"
            class="p-4 bg-gradient-to-br from-blue-50/80 via-blue-100/60 to-blue-200/40 backdrop-blur-sm rounded-xl border border-blue-200 border-opacity-60 shadow-sm"
          >
            <div class="flex items-center">
              <div class="w-12 h-12 bg-gradient-to-tr from-blue-500/80 via-blue-300/60 to-blue-100/40 rounded-xl flex items-center justify-center text-blue-900 text-lg font-bold shadow-lg border border-blue-200 border-opacity-40">
                {{ currentUser.username.charAt(0).toUpperCase() }}
              </div>
              <div class="ml-4">
                <p class="text-blue-900 font-semibold drop-shadow-sm">{{ currentUser.username }}</p>
                <p class="text-blue-500 text-sm capitalize opacity-80">{{ currentUser.role }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="flex-1 p-6">
          <div class="space-y-3">
            <div class="mb-6">
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-3">Main Navigation</p>
            </div>
            
            <button
              (click)="onNavigate('dashboard')"
              [class]="getButtonClass('dashboard')"
              class="w-full flex items-center px-5 py-4 text-left rounded-xl transition-all duration-300 group hover:shadow-lg"
            >
              <div class="w-10 h-10 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center mr-4 transition-colors duration-300">
                <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 0 01-2-2v-2z" />
                </svg>
              </div>
              <div>
                <span class="font-semibold text-gray-700 group-hover:text-gray-900">Building Dashboard</span>
                <p class="text-sm text-gray-500 group-hover:text-gray-600">Manage building data</p>
              </div>
            </button>

            <button
              (click)="onNavigate('map')"
              [class]="getButtonClass('map')"
              class="w-full flex items-center px-5 py-4 text-left rounded-xl transition-all duration-300 group hover:shadow-lg"
            >
              <div class="w-10 h-10 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center mr-4 transition-colors duration-300">
                <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div>
                <span class="font-semibold text-gray-700 group-hover:text-gray-900">Interactive Map</span>
                <p class="text-sm text-gray-500 group-hover:text-gray-600">View buildings on map</p>
              </div>
            </button>

            <div class="flex-1"></div> <!-- Push logout to the bottom -->

            <div class="border-t border-gray-200 pt-4 mt-24">
              <button
                (click)="onNavigate('logout')"
                [class]="getButtonClass('logout')"
                class="w-full flex items-center px-5 py-4 text-left rounded-xl transition-all duration-300 group hover:shadow-lg"
              >
                <div class="w-10 h-10 rounded-xl bg-red-50 group-hover:bg-red-100 flex items-center justify-center mr-4 transition-colors duration-300">
                  <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <div>
                  <span class="font-semibold text-gray-700 group-hover:text-red-700">Sign Out</span>
                  <p class="text-sm text-gray-500 group-hover:text-red-600">Logout securely</p>
                </div>
              </button>
            </div>
          </div>

          
        </nav>
      </div>

      <!-- Collapsed Sidebar -->
      <div *ngIf="!sidebarExpanded" class="w-full h-full flex flex-col bg-white border-r border-gray-100">
        <!-- Collapsed Header -->
        <div class="p-4 border-b border-gray-100 bg-gradient-to-r from-slate-700 to-slate-800">
          <button
            (click)="onToggleSidebar()"
            class="w-12 h-12 rounded-xl hover:bg-white hover:bg-opacity-15 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-30 group flex items-center justify-center"
            [attr.aria-label]="'Expand sidebar'"
          >
            <svg class="w-6 h-6 text-white group-hover:scale-105 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <!-- Collapsed Navigation -->
        <nav class="flex-1 p-3">
          <div class="space-y-3">
            <!-- Dashboard Icon -->
            <button
              (click)="onNavigate('dashboard')"
              [class]="getCollapsedButtonClass('dashboard')"
              class="w-12 h-12 rounded-xl transition-all duration-300 group hover:shadow-lg flex items-center justify-center"
              [attr.aria-label]="'Building Dashboard'"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>

            <!-- Map Icon -->
            <button
              (click)="onNavigate('map')"
              [class]="getCollapsedButtonClass('map')"
              class="w-12 h-12 rounded-xl transition-all duration-300 group hover:shadow-lg flex items-center justify-center"
              [attr.aria-label]="'Interactive Map'"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </button>
          </div>
        </nav>
      </div>
    </aside>
  `,
})
export class SidebarNavigationComponent implements OnInit {
  @Input() activeView: NavigationView = 'dashboard';
  @Input() sidebarExpanded: boolean = true;
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

  getSidebarClasses(): string {
    const baseClasses = 'bg-white shadow-2xl h-full flex flex-col relative border-r border-gray-100 transition-all duration-300';
    const expandedWidth = 'w-80';
    const collapsedWidth = 'w-16';
    const mobileClasses = 'md:relative fixed z-50 md:z-auto';
    
    return `${baseClasses} ${this.sidebarExpanded ? expandedWidth : collapsedWidth} ${mobileClasses}`;
  }

  getButtonClass(view: NavigationView): string {
    const activeClass = 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-md border border-blue-200 transform scale-[1.02]';
    const inactiveClass = 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300';
    
    // Special styling for logout button
    if (view === 'logout') {
      return this.activeView === view
        ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 shadow-md border border-red-200 transform scale-[1.02]'
        : inactiveClass + ' hover:bg-red-50 hover:border-red-200';
    }
    
    return this.activeView === view ? activeClass : inactiveClass;
  }

  getCollapsedButtonClass(view: NavigationView): string {
    if (view === 'dashboard') {
      return this.activeView === view 
        ? 'bg-blue-100 text-blue-600 border border-blue-200 shadow-md'
        : 'bg-gray-50 text-blue-500 hover:bg-blue-50 hover:text-blue-600 border border-gray-200';
    }
    if (view === 'map') {
      return this.activeView === view 
        ? 'bg-emerald-100 text-emerald-600 border border-emerald-200 shadow-md'
        : 'bg-gray-50 text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600 border border-gray-200';
    }
    return 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200';
  }
} 