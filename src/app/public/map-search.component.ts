import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BuildingsService } from '../services/buildings.service';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, switchMap, catchError, of } from 'rxjs';

@Component({
  selector: 'app-map-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-[100vh] bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-6">
      <div class="w-full max-w-2xl">
        <!-- Header Section -->
        <div class="text-center mb-10">
          <div class="flex items-center justify-center mb-6">
            <img 
              src="/rwanda_ministry_of_infrastructure_mininfra__logo.jpeg" 
              alt="MININFRA Logo" 
              class="h-16 w-auto mr-4"
            >
            <div class="text-left">
              <h1 class="text-3xl font-bold text-gray-800">Building Registry</h1>
              <p class="text-blue-600 font-medium">Ministry of Infrastructure</p>
            </div>
          </div>
          <p class="text-gray-600 text-lg">Search for any building in Rwanda using its unique identifier</p>
        </div>

        <!-- Search Form -->
        <div class="bg-white rounded-3xl shadow-2xl border border-blue-100 p-10 sm:p-12 relative">
          <!-- Search Input Container -->
          <div class="relative">
            <form
              (ngSubmit)="onSearch()"
              #searchForm="ngForm"
              class="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch"
              autocomplete="off"
            >
              <!-- Search Input with Enhanced Styling -->
              <div class="flex-1 flex flex-col justify-center relative">
                <label for="searchQuery" class="block text-sm font-medium text-gray-700 mb-2">
                  Building Identifier
                </label>
                <div class="relative">
                  <input
                    type="text"
                    id="searchQuery"
                    name="searchQuery"
                    [(ngModel)]="searchQuery"
                    (input)="onInputChange($event)"
                    required
                    #searchInput="ngModel"
                    class="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 focus:bg-white text-base placeholder-gray-400 tracking-tight shadow-sm hover:border-gray-300 peer"
                    placeholder="Enter UPI or Building ID (e.g., RW-KGL-S0190114990-E3012962286)"
                    [class.border-red-400]="searchInput.invalid && searchInput.touched"
                    [class.border-green-400]="isValidFormat && searchQuery.length > 0"
                    [disabled]="isLoading"
                    maxlength="64"
                    spellcheck="false"
                    autocomplete="off"
                  >
                  <!-- Input Icons -->
                  <div class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <svg *ngIf="!isLoading && !isValidFormat && searchQuery.length > 0" 
                         class="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <svg *ngIf="isValidFormat && searchQuery.length > 0 && !isLoading" 
                         class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <svg *ngIf="isLoading" 
                         class="animate-spin w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Enhanced Search Button -->
              <div class="flex flex-col justify-end">
                <button
                  type="submit"
                  [disabled]="searchForm.invalid || isLoading || !isValidFormat"
                  class="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base whitespace-nowrap shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                  aria-label="Search Building"
                >
                  <ng-container *ngIf="!isLoading; else loadingTpl">
                    <svg class="w-5 h-5 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Search</span>
                  </ng-container>
                  <ng-template #loadingTpl>
                    <svg class="animate-spin mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Searching...</span>
                  </ng-template>
                </button>
              </div>
            </form>

            <!-- Format Guidance -->
            <div class="mt-4 text-sm space-y-2">
              <div *ngIf="searchInput.invalid && searchInput.touched" class="text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>Building identifier is required</span>
              </div>
              
              <div *ngIf="searchQuery.length > 0 && !isValidFormat" class="text-orange-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Expected format: RW-[Province]-[Coordinates] (e.g., RW-KGL-S0190114990-E3012962286)</span>
              </div>
              
              <div *ngIf="isValidFormat && searchQuery.length > 0" class="text-green-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Valid building ID format</span>
              </div>
            </div>

            <!-- Error Message -->
            <div *ngIf="errorMessage" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div class="flex items-center text-red-800">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="font-medium">{{ errorMessage }}</span>
              </div>
            </div>
          </div>

          <!-- Sample IDs Section -->
          <div class="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
            <h3 class="text-sm font-semibold text-blue-900 mb-3">Try these sample Building IDs:</h3>
            <div class="space-y-2">
              <button
                *ngFor="let sampleId of sampleIds"
                type="button"
                (click)="fillSampleId(sampleId)"
                class="block w-full text-left px-3 py-2 text-sm font-mono text-blue-700 bg-white rounded-lg border border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200"
              >
                {{ sampleId }}
              </button>
            </div>
          </div>

          <!-- Access Dashboard Link -->
          <div class="text-center mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              (click)="goToDashboard()"
              class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 focus:outline-none focus:underline"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9a2 2 0 01-2-2z" />
              </svg>
              Access Administrative Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class MapSearchComponent implements OnDestroy {
  private router = inject(Router);
  private buildingsService = inject(BuildingsService);
  private destroy$ = new Subject<void>();

  searchQuery = '';
  isLoading = false;
  isValidFormat = false;
  errorMessage = '';

  sampleIds = [
    'RW-KGL-S0190114990-E3012962286',
  ];

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onInputChange(event: any): void {
    this.searchQuery = event.target.value;
    this.validateFormat();
    this.errorMessage = '';
  }

  private validateFormat(): void {
    // Validate Rwanda building ID format: RW-[3 letters]-S[10 digits]-E[10 digits]
    const rwandaBuildingIdPattern = /^RW-[A-Z]{3}-S\d{10}-E\d{10}$/;
    this.isValidFormat = rwandaBuildingIdPattern.test(this.searchQuery.trim());
  }

  fillSampleId(sampleId: string): void {
    this.searchQuery = sampleId;
    this.validateFormat();
    this.errorMessage = '';
  }

  onSearch(): void {
    if (this.searchQuery.trim().length > 0 && this.isValidFormat) {
      this.isLoading = true;
      this.errorMessage = '';

      this.buildingsService.searchBuildingById(this.searchQuery.trim())
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response.found && response.building) {
              // Navigate to map view with building data
              this.router.navigate(['/map', this.searchQuery.trim()]);
            } else {
              this.errorMessage = response.message || 'Building not found. Please verify the Building ID and try again.';
            }
          },
          error: (error) => {
            this.isLoading = false;
            this.errorMessage = 'Search failed. Please check your connection and try again.';
            console.error('Search error:', error);
          }
        });
    }
  }

  goToDashboard(): void {
    this.router.navigate(['/login']);
  }
}