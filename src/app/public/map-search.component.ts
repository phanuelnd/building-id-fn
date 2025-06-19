import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-map-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-[100vh] bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-6">
      <div class="w-full max-w-2xl">
        <!-- Search Form -->
        <div class="bg-white rounded-2xl shadow-2xl border border-blue-100 p-10 sm:p-12">
          <form
            (ngSubmit)="onSearch()"
            #searchForm="ngForm"
            class="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch"
            autocomplete="off"
          >
            <!-- Search Input -->
            <div class="flex-1 flex flex-col justify-center">
              <label for="searchQuery" class="sr-only">UPI or Building ID</label>
              <input
                type="text"
                id="searchQuery"
                name="searchQuery"
                [(ngModel)]="searchQuery"
                required
                #searchInput="ngModel"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-gray-50 focus:bg-white text-base placeholder-gray-400 tracking-tight shadow-sm"
                placeholder="Enter UPI or Building ID"
                [class.border-red-500]="searchInput.invalid && searchInput.touched"
                [disabled]="isLoading"
                maxlength="64"
                spellcheck="false"
                autocomplete="off"
              >
            </div>

            <!-- Search Button -->
            <button
              type="submit"
              [disabled]="searchForm.invalid || isLoading"
              class="flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-base whitespace-nowrap shadow-sm"
              aria-label="View on Map"
            >
              <ng-container *ngIf="!isLoading; else loadingTpl">
                <svg class="w-4 h-4 mr-2 -ml-1 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span>View on Map</span>
              </ng-container>
              <ng-template #loadingTpl>
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Searching...</span>
              </ng-template>
            </button>
          </form>

          <!-- Error Message -->
          <div *ngIf="searchInput.invalid && searchInput.touched" class="mt-2 text-sm text-red-600 min-h-[1.5rem]">
            <span *ngIf="searchInput.errors?.['required']">UPI or Building ID is required</span>
          </div>

          <!-- Access Dashboard Link -->
          <div class="text-center mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              (click)="goToDashboard()"
              class="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 focus:outline-none focus:underline"
            >
              Access Dashboard
              <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class MapSearchComponent {
  private router = inject(Router);

  searchQuery = '';
  isLoading = false;

  onSearch(): void {
    if (this.searchQuery.trim().length > 0) {
      this.isLoading = true;

      // Simulate search process
      setTimeout(() => {
        this.isLoading = false;
        // Redirect to map view with the search query
        this.router.navigate(['/map', this.searchQuery.trim()]);
      }, 800);
    }
  }

  goToDashboard(): void {
    this.router.navigate(['/login']);
  }
}