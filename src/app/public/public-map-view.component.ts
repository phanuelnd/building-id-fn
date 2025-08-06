import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Building } from '../models/building.model';
import { BuildingsService, UPISearchResponse, CoordinateSearchResponse } from '../services/buildings.service';
import { environment } from '../environments/environment';
import { Subject, takeUntil } from 'rxjs';

// Google Maps types
declare global {
  interface Window {
    google: any;
    initMap: () => void;
    openInGoogleMaps: () => void;
    shareLocation: () => void;
    copyBuildingIDToClipboard: (buildingId: string, btn: HTMLElement) => void;
  }
}

@Component({
  selector: 'app-public-map-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <!-- Enhanced Header with Search -->
      <header class="bg-white shadow-lg border-b border-gray-200 px-6 py-4 z-10 relative">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-3">
              <img 
                src="/rwanda_ministry_of_infrastructure_mininfra__logo.jpeg" 
                alt="MININFRA Logo" 
                class="h-10 w-auto"
              >
              <div>
                <h1 class="text-xl font-bold text-gray-800">Building Registry</h1>
                <p class="text-blue-600 text-sm font-medium">Ministry of Infrastructure</p>
              </div>
            </div>
          </div>
          
          <div class="flex items-center space-x-4">

          </div>
        </div>

                 <!-- Enhanced Search Bar -->
         <div class="mt-4">
           <form
             (ngSubmit)="onSearch()"
             #searchForm="ngForm"
             class="max-w-4xl mx-auto"
             autocomplete="off"
           >
             <div class="flex gap-3 items-stretch">
               <!-- Search Type Selector -->
               <select
                 [(ngModel)]="searchType"
                 (ngModelChange)="onSearchTypeChange($event)"
                 name="searchType"
                 class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm font-medium min-w-[120px] transition-all duration-300"
               >
                 <option value="building_id">Building ID</option>
                 <option value="upi">UPI</option>
               </select>

               <!-- Enhanced Search Input -->
               <div class="flex-1 relative">
                 <input
                   type="text"
                   [(ngModel)]="searchQuery"
                   (input)="onInputChange($event)"
                   name="searchQuery"
                   required
                   #searchInput="ngModel"
                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-base font-mono bg-gray-50 focus:bg-white"
                   [placeholder]="getPlaceholderText()"
                   [class.border-red-400]="searchInput.invalid && searchInput.touched"
                   [class.border-green-400]="isValidFormat && searchQuery.length > 0"
                   [class.focus:ring-green-100]="isValidFormat && searchQuery.length > 0"
                   [class.focus:border-green-500]="isValidFormat && searchQuery.length > 0"
                   [disabled]="isLoading"
                   maxlength="64"
                   spellcheck="false"
                   autocomplete="off"
                 >
                 <!-- Status Icons -->
                 <div class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                   <div *ngIf="isLoading" class="flex items-center">
                     <svg class="animate-spin w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                       <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                       <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                   </div>
                   <div *ngIf="isValidFormat && searchQuery.length > 0 && !isLoading" class="flex items-center">
                     <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                   </div>
                   <div *ngIf="!isValidFormat && searchQuery.length > 0 && !isLoading" class="flex items-center">
                     <svg class="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                     </svg>
                   </div>
                 </div>
               </div>

                              <!-- Enhanced Search Button -->
               <button
                 type="submit"
                 [disabled]="searchForm.invalid || isLoading || !isValidFormat"
                 class="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap shadow-md hover:shadow-lg cursor-pointer flex items-center gap-2"
               >
                 <svg *ngIf="!isLoading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                 </svg>
                 <svg *ngIf="isLoading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                   <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                   <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 <span>{{ isLoading ? 'Searching...' : 'Search' }}</span>
               </button>

               <!-- Clear Results Button (inline) -->
               <button
                 *ngIf="searchResults.length > 0 || building"
                 (click)="clearResults()"
                 class="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 cursor-pointer transition-colors duration-200 text-sm font-medium flex items-center gap-2"
               >
                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                 </svg>
                 Clear
               </button>
             </div>
           </form>
         </div>

                 <!-- Search Results Summary -->
         <div *ngIf="searchResults.length > 0 && showSearchMessage" 
              class="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg transition-all duration-300">
           <div class="flex items-center justify-between text-green-800 text-sm">
             <div class="flex items-center">
               <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               <span>Found {{ searchResults.length }} building(s) for UPI: <strong>{{ lastSearchQuery }}</strong></span>
             </div>
             <button
               (click)="hideSearchMessage()"
               class="ml-2 text-green-600 hover:text-green-800 transition-colors duration-200"
               title="Dismiss"
             >
               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>
           </div>
         </div>

        <!-- Error Message -->
        <div *ngIf="errorMessage" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex items-center justify-between text-red-800 text-sm">
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ errorMessage }}</span>
            </div>
            <button
              (click)="clearError()"
              class="ml-2 text-red-600 hover:text-red-800 transition-colors duration-200"
              title="Dismiss"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content Area -->
      <div class="flex-1 flex overflow-hidden relative">
        <!-- Google Maps Container -->
        <div class="flex-1 relative">
          <!-- Loading State -->
          <div *ngIf="loading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-20">
            <div class="text-center">
              <div class="relative">
                <svg class="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="w-6 h-6 bg-blue-600 rounded-full animate-pulse"></div>
                </div>
              </div>
              <p class="text-gray-600 font-medium">Loading building location...</p>
              <p class="text-gray-400 text-sm mt-1">Initializing interactive map</p>
            </div>
          </div>

          <!-- Error State -->
          <div *ngIf="!loading && !building && searchResults.length === 0 && lastSearchQuery && searchCompleted" class="absolute inset-0 flex items-center justify-center z-20">
            <div class="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl border border-gray-200">
              <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-gray-800 mb-4">No Results Found</h3>
              <p class="text-gray-600 mb-6 leading-relaxed">
                We couldn't locate any buildings with the identifier <strong>"{{ lastSearchQuery }}"</strong>. 
                Please verify the {{ searchType === 'building_id' ? 'Building ID' : 'UPI' }} format and try again.
              </p>
              <div class="space-y-3">
                <button
                  (click)="clearResults()"
                  class="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  Try Another Search
                </button>
                <button
                  (click)="refreshSearch()"
                  class="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                >
                  Refresh Search
                </button>
              </div>
            </div>
          </div>

          <!-- Google Maps -->
          <div #mapContainer id="map" class="w-full h-full cursor-crosshair"></div>

          <!-- Click instruction overlay -->
          <div *ngIf="!loading && !building && searchResults.length === 0" class="absolute bottom-4 left-4 right-4 z-10">
            <div class="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-3 text-center">
              <div class="flex items-center justify-center space-x-2 text-sm text-gray-700">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.122 2.122" />
                </svg>
                <span><strong>Tip:</strong> Click anywhere on the map to search for buildings at that location</span>
              </div>
            </div>
          </div>

          <!-- Search in progress indicator -->
          <div *ngIf="isSearchingCoordinates" class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <div class="bg-white rounded-lg shadow-lg p-4 flex items-center space-x-3">
              <svg class="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="text-sm font-medium text-gray-700">Searching for building...</span>
            </div>
          </div>

          <!-- Map Controls -->
          <div *ngIf="!loading && (building || searchResults.length > 0)" class="absolute top-4 left-4 z-10 space-y-2">
            <!-- Map Type Toggle -->
            <div class="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              <button
                (click)="toggleMapType('roadmap')"
                [class.bg-blue-600]="currentMapType === 'roadmap'"
                [class.text-white]="currentMapType === 'roadmap'"
                [class.text-gray-700]="currentMapType !== 'roadmap'"
                class="px-4 py-2 text-sm font-medium transition-colors duration-200 hover:bg-blue-50 cursor-pointer"
              >
                Map
              </button>
              <button
                (click)="toggleMapType('satellite')"
                [class.bg-blue-600]="currentMapType === 'satellite'"
                [class.text-white]="currentMapType === 'satellite'"
                [class.text-gray-700]="currentMapType !== 'satellite'"
                class="px-4 py-2 text-sm font-medium transition-colors duration-200 hover:bg-blue-50 cursor-pointer"
              >
                Satellite
              </button>
            </div>

            <!-- Zoom Controls -->
            <div class="bg-white rounded-lg shadow-lg border border-gray-200 p-1">
              <button
                (click)="zoomIn()"
                class="block w-full p-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200 rounded cursor-pointer"
                title="Zoom In"
              >
                <svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              <div class="border-t border-gray-200 my-1"></div>
              <button
                (click)="zoomOut()"
                class="block w-full p-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200 rounded cursor-pointer"
                title="Zoom Out"
              >
                <svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                </svg>
              </button>
            </div>

            <!-- Center on Building -->
            <button
              (click)="centerOnBuilding()"
              class="bg-white rounded-lg shadow-lg border border-gray-200 p-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
              title="Center on Building"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          <!-- Building Status Badge -->
          <div *ngIf="!loading && building" class="absolute top-4 right-4 z-10">
            <div class="bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-2">
              <div class="flex items-center space-x-2">
                <div
                  class="w-3 h-3 rounded-full"
                  [class.bg-green-500]="building.status === 'BUILT'"
                  [class.bg-yellow-500]="building.status === 'UNDER_CONSTRUCTION'"
                  [class.bg-red-500]="building.status === 'PLANNED'"
                  [class.bg-gray-500]="!['BUILT', 'UNDER_CONSTRUCTION', 'PLANNED'].includes(building.status)"
                ></div>
                <span class="text-sm font-medium text-gray-700">{{ getStatusLabel(building.status) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Enhanced Information Panel -->
        <div class="w-96 bg-white shadow-2xl border-l border-gray-200 overflow-y-auto z-10" [class.hidden]="!building && searchResults.length === 0">
          <div *ngIf="building" class="h-full">
            <!-- Header -->
            <div class="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-12 h-12 bg-white bg-opacity-80 rounded-lg flex items-center justify-center shadow-lg border border-blue-200">
                  <svg class="w-8 h-8 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h2 class="text-xl font-bold">Building Details</h2>
                  <p class="text-blue-100 text-sm">Complete Information</p>
                </div>
              </div>
              
              <div class="bg-white bg-opacity-20 rounded-lg p-3">
                <div class="text-xs text-black mb-1">Building ID</div>
                <div class="font-mono text-black break-all">{{ building.building_id }}</div>
              </div>
            </div>

            <!-- Content -->
            <div class="p-6 space-y-6">
              <!-- Quick Stats -->
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-green-50 rounded-xl p-4 text-center">
                  <div class="text-2xl font-bold text-green-600">{{ building.status === 'BUILT' ? '✓' : '○' }}</div>
                  <div class="text-xs text-green-700 mt-1">Status</div>
                </div>
                <div class="bg-blue-50 rounded-xl p-4 text-center">
                  <div class="text-lg font-bold text-blue-600">{{ building.province.substring(0, 3).toUpperCase() }}</div>
                  <div class="text-xs text-blue-700 mt-1">Province</div>
                </div>
              </div>

              <!-- Location Information -->
              <div class="space-y-4">
                <h3 class="font-bold text-gray-800 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  Administrative Location
                </h3>
                
                <div class="space-y-3">
                  <div class="flex justify-between items-center py-2 border-b border-gray-100">
                    <span class="text-gray-600 text-sm">Province</span>
                    <span class="font-medium text-gray-900">{{ building.province }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-gray-100">
                    <span class="text-gray-600 text-sm">District</span>
                    <span class="font-medium text-gray-900">{{ building.district }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-gray-100">
                    <span class="text-gray-600 text-sm">Sector</span>
                    <span class="font-medium text-gray-900">{{ building.sector }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-gray-100">
                    <span class="text-gray-600 text-sm">Cell</span>
                    <span class="font-medium text-gray-900">{{ building.cell }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2">
                    <span class="text-gray-600 text-sm">Village</span>
                    <span class="font-medium text-gray-900">{{ building.village }}</span>
                  </div>
                </div>
              </div>

              <!-- Coordinates -->
              <div class="space-y-4">
                <h3 class="font-bold text-gray-800 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                  Geographic Coordinates
                </h3>
                
                <div class="bg-purple-50 rounded-xl p-4 space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-purple-700 text-sm font-medium">Latitude</span>
                    <code class="bg-white px-2 py-1 rounded text-sm font-mono text-purple-900">{{ building.latitude.toFixed(8) }}</code>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-purple-700 text-sm font-medium">Longitude</span>
                    <code class="bg-white px-2 py-1 rounded text-sm font-mono text-purple-900">{{ building.longitude.toFixed(8) }}</code>
                  </div>
                  <button
                    (click)="copyCoordinates()"
                    class="w-full mt-2 text-xs bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 cursor-pointer"
                  >
                    Copy Coordinates
                  </button>
                </div>
              </div>

              <!-- Additional Information -->
              <div class="space-y-4">
                <h3 class="font-bold text-gray-800 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Additional Details
                </h3>
                
                <div class="space-y-3 text-sm">
                  <div class="flex justify-between items-center py-2 border-b border-gray-100">
                    <span class="text-gray-600">Data Source</span>
                    <span class="font-medium text-gray-900 text-xs">{{ building.data_source }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-gray-100">
                    <span class="text-gray-600">Created</span>
                    <span class="font-medium text-gray-900 text-xs">{{ formatDate(building.created_at) }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2">
                    <span class="text-gray-600">Last Updated</span>
                    <span class="font-medium text-gray-900 text-xs">{{ formatDate(building.updated_at) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="border-t border-gray-200 p-6 bg-gray-50 space-y-3">
              <button
                (click)="openInGoogleMaps()"
                class="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center font-medium cursor-pointer"
              >
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                Open in Google Maps
              </button>
              
              <button
                (click)="shareLocation()"
                class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center font-medium cursor-pointer"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share Location & Directions
              </button>
              
              <button
                (click)="downloadDetails()"
                class="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center font-medium cursor-pointer"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Details
              </button>
            </div>

            <!-- UPI Search Results List -->
            <div *ngIf="searchResults.length > 1" class="h-full">
              <!-- Header -->
              <div class="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
                <div class="flex items-center space-x-3 mb-4">
                  <div class="w-12 h-12 bg-white bg-opacity-80 rounded-lg flex items-center justify-center shadow-lg border border-purple-200">
                    <svg class="w-8 h-8 text-purple-700" fill="currentColor" viewBox="0 0 24 24">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h2 class="text-xl font-bold">UPI Search Results</h2>
                    <p class="text-purple-100 text-sm">{{ searchResults.length }} Buildings Found</p>
                  </div>
                </div>
                
                <div class="bg-white bg-opacity-20 rounded-lg p-3">
                  <div class="text-xs text-black mb-1">UPI (Unique Parcel Identifier)</div>
                  <div class="font-mono text-black break-all">{{ lastSearchQuery }}</div>
                </div>
              </div>

              <!-- Current Building Card -->
              <div class="p-4">
                <div *ngIf="currentBuilding" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center space-x-2">
                      <span class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {{ currentBuildingIndex + 1 }}
                      </span>
                      <div>
                        <h3 class="font-semibold text-blue-800 text-sm">Building {{ currentBuildingIndex + 1 }}</h3>
                        <p class="text-xs text-blue-600">{{ currentBuildingIndex + 1 }} of {{ searchResults.length }}</p>
                      </div>
                    </div>
                    <div
                      class="px-2 py-1 rounded-full text-xs font-medium"
                      [class.bg-green-100]="currentBuilding.status === 'BUILT'"
                      [class.text-green-800]="currentBuilding.status === 'BUILT'"
                      [class.bg-yellow-100]="currentBuilding.status === 'UNDER_CONSTRUCTION'"
                      [class.text-yellow-800]="currentBuilding.status === 'UNDER_CONSTRUCTION'"
                      [class.bg-red-100]="currentBuilding.status === 'PLANNED'"
                      [class.text-red-800]="currentBuilding.status === 'PLANNED'"
                    >
                      {{ getStatusLabel(currentBuilding.status) }}
                    </div>
                  </div>
                  
                  <div class="space-y-2 text-sm">
                    <div class="font-mono text-xs text-gray-600 bg-white p-2 rounded border">
                      {{ currentBuilding.building_id }}
                    </div>
                    <div class="text-gray-700">
                      📍 {{ currentBuilding.village }}, {{ currentBuilding.cell }}, {{ currentBuilding.sector }}
                    </div>
                    <div class="text-gray-600">
                      {{ currentBuilding.district }}, {{ currentBuilding.province }}
                    </div>
                    <div class="text-xs text-gray-500">
                      Lat: {{ currentBuilding.latitude.toFixed(6) }}, Lng: {{ currentBuilding.longitude.toFixed(6) }}
                    </div>
                  </div>
                </div>

                <!-- Pagination Controls -->
                <div class="bg-gray-50 rounded-lg p-3 mb-4">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-1">
                      <button
                        (click)="goToFirstBuilding()"
                        [disabled]="currentBuildingIndex === 0"
                        class="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        title="First"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        (click)="goToPreviousBuilding()"
                        [disabled]="currentBuildingIndex === 0"
                        class="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        title="Previous"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    </div>
                    
                    <div class="flex items-center space-x-2">
                      <span class="text-sm text-gray-600">Go to:</span>
                      <input
                        type="number"
                        [(ngModel)]="navigationIndex"
                        (keyup.enter)="goToBuildingByIndex()"
                        [min]="1"
                        [max]="searchResults.length"
                        class="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                      <span class="text-sm text-gray-600">of {{ searchResults.length }}</span>
                    </div>

                    <div class="flex items-center space-x-1">
                      <button
                        (click)="goToNextBuilding()"
                        [disabled]="currentBuildingIndex === searchResults.length - 1"
                        class="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Next"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <button
                        (click)="goToLastBuilding()"
                        [disabled]="currentBuildingIndex === searchResults.length - 1"
                        class="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Last"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Quick Actions -->
                <div class="space-y-2">
                  <button
                    (click)="openInGoogleMaps()"
                    class="w-full bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center font-medium text-sm cursor-pointer"
                  >
                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    Open in Google Maps
                  </button>
                  
                  <button
                    (click)="shareLocation()"
                    class="w-full bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center font-medium text-sm cursor-pointer"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    Share Location & Directions
                  </button>

                  <button
                    (click)="centerOnAllBuildings()"
                    class="w-full bg-purple-600 text-white py-2 px-3 rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center font-medium text-sm cursor-pointer"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    View All Buildings
                  </button>
                  
                  <button
                    (click)="downloadUPIResults()"
                    class="w-full bg-gray-600 text-white py-2 px-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center font-medium text-sm cursor-pointer"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Results
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PublicMapViewComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private buildingsService = inject(BuildingsService);
  private destroy$ = new Subject<void>();

  searchQuery = '';
  searchType: 'building_id' | 'upi' = 'building_id';
  building: Building | null = null;
  searchResults: Building[] = [];
  lastSearchQuery = '';
  loading = false;
  isLoading = false;
  isValidFormat = false;
  errorMessage = '';
  errorTimeout: any = null;
  searchCompleted = false;
  showSearchMessage = true;
  searchMessageTimeout: any = null;
  currentBuilding: Building | null = null;
  currentBuildingIndex = 0;
  navigationIndex = 1;
  map: any;
  buildingMarkers: any[] = [];
  buildingPolygons: any[] = [];
  currentMapType: 'roadmap' | 'satellite' = 'satellite';
  clickedBuilding: Building | null = null;
  clickedBuildingInfoWindow: any = null;
  isSearchingCoordinates = false;

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['query']) {
        this.searchQuery = params['query'];
        this.searchType = 'building_id';
        this.validateFormat();
        this.loadBuilding();
      }
    });

    window.openInGoogleMaps = () => {
      this.openInGoogleMaps();
    };
    window.shareLocation = () => {
      this.shareLocation();
    };

    window.copyBuildingIDToClipboard = (buildingId: string, btn: HTMLElement) => {
      this.copyBuildingIDToClipboard(buildingId, btn);
    };

  }

  ngAfterViewInit(): void {
    this.loadGoogleMaps();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.clearError();
    this.hideSearchMessage();
    
    // Clean up clicked building info window
    if (this.clickedBuildingInfoWindow) {
      this.clickedBuildingInfoWindow.close();
      this.clickedBuildingInfoWindow = null;
    }
  }

  private loadGoogleMaps(): void {
    if (typeof window.google === 'undefined') {
      // Load Google Maps API
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=geometry`;
      script.defer = true;
      script.async = true;
      script.onload = () => this.initializeMap();
      document.head.appendChild(script);
    } else {
      this.initializeMap();
    }
  }

  private initializeMap(): void {
    if (!this.mapContainer) return;

    const mapOptions = {
      zoom: 12,
      center: { lat: -1.9441, lng: 30.0619 }, // Default to Kigali
      mapTypeId: this.currentMapType,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
      zoomControl: false,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    };

    this.map = new window.google.maps.Map(this.mapContainer.nativeElement, mapOptions);

    // Add click listener for coordinate-based building search
    this.map.addListener('click', (event: any) => {
      this.onMapClick(event);
    });

    // Update map when building is loaded
    if (this.building) {
      this.displayBuildingOnMap();
    } else if (this.searchResults.length > 0) {
      this.displayMultipleBuildingsOnMap();
    }
  }

  private loadBuilding(): void {
    this.loading = true;
    this.building = null;

    this.buildingsService.searchBuildingById(this.searchQuery)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;
          if (response.found && response.building) {
            this.building = response.building;
            if (this.map) {
              this.displayBuildingOnMap();
            }
          }
        },
        error: (error) => {
          this.loading = false;
          console.error('Error loading building:', error);
        }
      });
  }

  private displayBuildingOnMap(): void {
    if (!this.map || !this.building) return;

    const buildingCenter = {
      lat: this.building.latitude,
      lng: this.building.longitude
    };

    // Center map on building
    this.map.setCenter(buildingCenter);
    this.map.setZoom(19);

    // Clear any existing markers first
    this.clearMapMarkers();

    // Add building marker
    const buildingMarker = new window.google.maps.Marker({
      position: buildingCenter,
      map: this.map,
      title: `Building: ${this.building.building_id}`,
      icon: {
        url: 'data:image/svg+xml;base64,' + btoa(`
          <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C7.163 0 0 7.163 0 16c0 8.837 7.163 16 16 16s16-7.163 16-16C32 7.163 24.837 0 16 0z" fill="#2563eb"/>
            <path d="M16 8c-4.411 0-8 3.589-8 8s3.589 8 8 8 8-3.589 8-8-3.589-8-8-8zm0 12c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z" fill="white"/>
            <path d="M16 32l-8-8h16l-8 8z" fill="#2563eb"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(32, 40),
        anchor: new window.google.maps.Point(16, 40)
      }
          });

    this.buildingMarkers.push(buildingMarker);

    // Add building footprint if available
    if (this.building.footprint && this.building.footprint.coordinates && this.building.footprint.coordinates[0]) {
      const polygonCoords = this.building.footprint.coordinates[0].map(coord => ({
        lat: coord[1],
        lng: coord[0]
      }));

      const buildingPolygon = new window.google.maps.Polygon({
        paths: polygonCoords,
        strokeColor: '#2563eb',
        strokeOpacity: 0.8,
        strokeWeight: 3,
        fillColor: '#2563eb',
        fillOpacity: 0.2,
        map: this.map
      });

      this.buildingPolygons.push(buildingPolygon);

      // Fit map to building bounds
      const bounds = new window.google.maps.LatLngBounds();
      polygonCoords.forEach(coord => bounds.extend(coord));
      this.map.fitBounds(bounds);
      
      // Ensure minimum zoom level
      const listener = window.google.maps.event.addListener(this.map, 'idle', () => {
        if (this.map.getZoom() > 20) this.map.setZoom(20);
        window.google.maps.event.removeListener(listener);
      });
    }

    // Add info window
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div class="p-3 max-w-xs">
          <h3 class="font-bold text-gray-800 mb-2">Building Information</h3>
          <div class="space-y-1 text-sm">
             <div class="bg-gray-100 p-2 rounded relative">
 <strong>ID</strong><br>
 <code class="text-xs">${this.building.building_id}</code>
 <button
   onclick="copyBuildingIDToClipboard('${this.building.building_id}', this)"
   class="group absolute top-2 right-2 text-blue-600 hover:underline text-xs cursor-pointer"
 >
   <span class="icon-copy block relative">
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
       <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
     </svg>
     <span class="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">Copy</span>
   </span>
   <span class="icon-check hidden relative">
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-green-600">
       <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
     </svg>
     <span class="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">Copied</span>
   </span>
 </button>
</div>
              <div><strong>Status:</strong> 
                <span class="px-2 py-1 rounded text-xs ${this.building.status === 'BUILT' ? 'bg-green-100 text-green-800' : this.building.status === 'UNDER_CONSTRUCTION' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}">
                  ${this.getStatusLabel(this.building.status)}
                </span>
              </div>
            <div><strong>Location:</strong> ${this.building.village}, ${this.building.cell}, ${this.building.sector}, ${this.building.district}, ${this.building.province}</div>
            <button
                onclick="openInGoogleMaps()"
                class="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center font-medium"
              >
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                Open in Google Maps
            </button>
            <button
                onclick="shareLocation()"
                class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center font-medium"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share Location & Directions
            </button>
  
          </div>
        </div>
      `
    });

    buildingMarker.addListener('click', () => {
      infoWindow.open(this.map, buildingMarker);
    });
  }

  toggleMapType(type: 'roadmap' | 'satellite'): void {
    this.currentMapType = type;
    if (this.map) {
      this.map.setMapTypeId(type);
    }
  }

  zoomIn(): void {
    if (this.map) {
      this.map.setZoom(this.map.getZoom() + 1);
    }
  }

  zoomOut(): void {
    if (this.map) {
      this.map.setZoom(this.map.getZoom() - 1);
    }
  }

  centerOnBuilding(): void {
    if (this.map && this.building) {
      this.map.setCenter({
        lat: this.building.latitude,
        lng: this.building.longitude
      });
      this.map.setZoom(19);
    }
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'BUILT': 'Built',
      'UNDER_CONSTRUCTION': 'Under Construction',
      'PLANNED': 'Planned',
      'DEMOLISHED': 'Demolished'
    };
    return statusMap[status] || status;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  copyBuildingIDToClipboard(buildingId: string, btn: HTMLElement): void {
    navigator.clipboard.writeText(buildingId).then(() => {
      const iconCopy = btn.querySelector(".icon-copy");
      const iconCheck = btn.querySelector(".icon-check");

      if (iconCopy && iconCheck) {
        iconCopy.classList.add("hidden");
        iconCheck.classList.remove("hidden");

        setTimeout(() => {
          iconCopy.classList.remove("hidden");
          iconCheck.classList.add("hidden");
        }, 2000);
      }
    });
  }


  shareLocation(): void {
    if (!this.building) return;

    const googleMapsUrl = this.generateGoogleMapsUrl();
    const locationText = `${this.building.village}, ${this.building.cell}, ${this.building.sector}, ${this.building.district}, ${this.building.province}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Building ${this.building.building_id}`,
        text: `Building Location: ${locationText}\n\nCoordinates: ${this.building.latitude.toFixed(6)}, ${this.building.longitude.toFixed(6)}\n\nOpen in Google Maps: ${googleMapsUrl}\n\nView Details: ${window.location.href}`,
        url: googleMapsUrl
      }).catch(() => {
        // Fallback if share fails
        this.copyLocationToClipboard(googleMapsUrl, locationText);
      });
    } else {
      // Fallback: copy comprehensive location info to clipboard
      this.copyLocationToClipboard(googleMapsUrl, locationText);
    }
  }

  private copyLocationToClipboard(googleMapsUrl: string, locationText: string): void {
    const shareText = `Building ${this.building?.building_id}

Location: ${locationText}
Coordinates: ${this.building?.latitude.toFixed(6)}, ${this.building?.longitude.toFixed(6)}

🗺️ Open in Google Maps: ${googleMapsUrl}
📋 View Details: ${window.location.href}`;

    navigator.clipboard.writeText(shareText).then(() => {
      this.showTemporaryMessage('Location details copied to clipboard!');
    }).catch(() => {
      // Final fallback - show the info in an alert
      alert(`Location: ${locationText}\n\nGoogle Maps: ${googleMapsUrl}`);
    });
  }

  openInGoogleMaps(): void {
    if (!this.building) return;
    
    const googleMapsUrl = this.generateGoogleMapsUrl();
    console.log('Opening Google Maps URL:', googleMapsUrl);
    window.open(googleMapsUrl, '_blank');
  }

  private generateGoogleMapsUrl(): string {
    if (!this.building) return '';
    
    const lat = this.building.latitude;
    const lng = this.building.longitude;
    const locationName = `${this.building.village}, ${this.building.district}`;
    
    // Create a Google Maps URL that opens directions to the location
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=&travelmode=driving`;
  }

  private generateGoogleMapsViewUrl(): string {
    if (!this.building) return '';
    
    const lat = this.building.latitude;
    const lng = this.building.longitude;
    const locationName = encodeURIComponent(`${this.building.village}, ${this.building.district}`);
    
    // Create a Google Maps URL that shows the location
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=`;
  }

  private showTemporaryMessage(message: string): void {
    // Create a temporary toast-like message
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  copyCoordinates(): void {
    if (this.building) {
      const coords = `${this.building.latitude}, ${this.building.longitude}`;
      navigator.clipboard.writeText(coords).then(() => {
        // You could show a toast notification here
        console.log('Coordinates copied to clipboard');
      });
    }
  }

  downloadDetails(): void {
    if (!this.building) return;

    const buildingData = {
      building_id: this.building.building_id,
      status: this.building.status,
      location: {
        province: this.building.province,
        district: this.building.district,
        sector: this.building.sector,
        cell: this.building.cell,
        village: this.building.village
      },
      coordinates: {
        latitude: this.building.latitude,
        longitude: this.building.longitude
      },
      data_source: this.building.data_source,
      created_at: this.building.created_at,
      updated_at: this.building.updated_at
    };

    const dataStr = JSON.stringify(buildingData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `building-${this.building.building_id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Dynamic search type handling
  onSearchTypeChange(newType: 'building_id' | 'upi'): void {
  
      // this.searchType = newType;
      // this.searchQuery = '';
      this.clearError();
      // this.clearResults();
      this.validateFormat();
      console.log(`Search type changed to: ${newType}`);

  }

  getPlaceholderText(): string {
    return this.searchType === 'building_id' 
      ? 'Enter Building ID (e.g., RW-KGL-S0190114990-E3012962286)' 
      : 'Enter UPI Parcel ID (e.g., 1/02/01/02/1060)';
  }

  getFormatHint(): string {
    if (this.searchType === 'building_id') {
      return 'Expected format: RW-[Province]-S[Latitude]-E[Longitude]';
    } else {
      return 'Expected format: x/yz/tz/vh/abcd (where abcd can be 2-4 digits)';
    }
  }

  // Search message auto-hide functionality
  hideSearchMessage(): void {
    this.showSearchMessage = false;
    if (this.searchMessageTimeout) {
      clearTimeout(this.searchMessageTimeout);
      this.searchMessageTimeout = null;
    }
  }

  private startSearchMessageTimer(): void {
    if (this.searchMessageTimeout) {
      clearTimeout(this.searchMessageTimeout);
    }
    this.showSearchMessage = true;
    this.searchMessageTimeout = setTimeout(() => {
      this.showSearchMessage = false;
    }, 5000); // Hide after 5 seconds
  }

  // Pagination methods for UPI search results
  goToFirstBuilding(): void {
    if (this.searchResults.length > 0) {
      this.currentBuildingIndex = 0;
      this.navigationIndex = 1;
      this.updateCurrentBuilding();
    }
  }

  goToPreviousBuilding(): void {
    if (this.currentBuildingIndex > 0) {
      this.currentBuildingIndex--;
      this.navigationIndex = this.currentBuildingIndex + 1;
      this.updateCurrentBuilding();
    }
  }

  goToNextBuilding(): void {
    if (this.currentBuildingIndex < this.searchResults.length - 1) {
      this.currentBuildingIndex++;
      this.navigationIndex = this.currentBuildingIndex + 1;
      this.updateCurrentBuilding();
    }
  }

  goToLastBuilding(): void {
    if (this.searchResults.length > 0) {
      this.currentBuildingIndex = this.searchResults.length - 1;
      this.navigationIndex = this.searchResults.length;
      this.updateCurrentBuilding();
    }
  }

  goToBuildingByIndex(): void {
    const index = this.navigationIndex - 1;
    if (index >= 0 && index < this.searchResults.length) {
      this.currentBuildingIndex = index;
      this.updateCurrentBuilding();
    } else {
      // Reset to current if invalid
      this.navigationIndex = this.currentBuildingIndex + 1;
    }
  }

  private updateCurrentBuilding(): void {
    if (this.searchResults.length > 0 && this.currentBuildingIndex >= 0 && this.currentBuildingIndex < this.searchResults.length) {
      this.currentBuilding = this.searchResults[this.currentBuildingIndex];
      this.building = this.currentBuilding; // Update the building details section
      this.selectBuilding(this.currentBuilding);
    }
  }

  refreshSearch(): void {
    this.loadBuilding();
  }





  // Search functionality methods
  onInputChange(event: any): void {
    this.searchQuery = event.target.value;
    if (this.searchType === 'upi') {
      this.formatUPI();
    }
    this.validateFormat();
    this.clearError();
  }

  private formatUPI(): void {
    // Remove any existing slashes and non-digit characters
    let cleaned = this.searchQuery.replace(/[^0-9]/g, '');
    
    // Apply UPI formatting: x/yz/tz/vh/abcd (where abcd can be 2-4 digits)
    let formatted = '';
    if (cleaned.length > 0) {
      formatted = cleaned.charAt(0);
      if (cleaned.length > 1) {
        formatted += '/' + cleaned.substring(1, 3);
      }
      if (cleaned.length > 3) {
        formatted += '/' + cleaned.substring(3, 5);
      }
      if (cleaned.length > 5) {
        formatted += '/' + cleaned.substring(5, 7);
      }
      if (cleaned.length > 7) {
        // Allow 2-4 digits for the last part
        formatted += '/' + cleaned.substring(7, Math.min(11, cleaned.length));
      }
    }
    
    this.searchQuery = formatted;
  }

  private validateFormat(): void {
    if (this.searchType === 'building_id') {
      // Validate Rwanda building ID format: RW-[3 letters]-S[10 digits]-E[10 digits]
      const rwandaBuildingIdPattern = /^RW-[A-Z]{3}-S\d{10}-E\d{10}$/;
      this.isValidFormat = rwandaBuildingIdPattern.test(this.searchQuery.trim());
    } else if (this.searchType === 'upi') {
      // Validate UPI format: x/yz/tz/vh/abcd (where abcd can be 2-4 digits)
      const upiPattern = /^\d{1}\/\d{2}\/\d{2}\/\d{2}\/\d{2,4}$/;
      this.isValidFormat = upiPattern.test(this.searchQuery.trim());
    }
  }

  onSearch(): void {
    if (this.searchQuery.trim().length > 0 && this.isValidFormat) {
      // Set both loading states and clear previous results to prevent error state flash
      this.isLoading = true;
      this.loading = true;
      this.searchCompleted = false;
      this.clearError();
      
      // Clear previous results immediately to prevent error state from showing
      this.building = null;
      this.searchResults = [];
      
      this.lastSearchQuery = this.searchQuery.trim();

      if (this.searchType === 'building_id') {
        this.searchByBuildingId();
      } else if (this.searchType === 'upi') {
        this.searchByUPI();
      }
    }
  }

  clearError(): void {
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
      this.errorTimeout = null;
    }
    this.errorMessage = '';
  }

  private showError(message: string): void {
    this.clearError();
    this.errorMessage = message;
    
    // Auto-dismiss error after 10 seconds
    this.errorTimeout = setTimeout(() => {
      this.clearError();
    }, 10000);
  }

  private searchByBuildingId(): void {
    this.buildingsService.searchBuildingById(this.searchQuery.trim())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.loading = false;
          this.searchCompleted = true;
          if (response.found && response.building) {
            this.building = response.building;
            this.searchResults = [];
            this.clearMapMarkers();
            if (this.map) {
              this.displayBuildingOnMap();
            }
          } else {
            this.showError(response.message || 'Building not found. Please verify the Building ID and try again.');
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.loading = false;
          this.searchCompleted = true;
          this.showError('Search failed. Please check your connection and try again.');
          console.error('Search error:', error);
        }
      });
  }

  private searchByUPI(): void {
    this.buildingsService.searchBuildingsByUPI(this.searchQuery.trim())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.loading = false;
          this.searchCompleted = true;
          if (response.found && response.buildings.length > 0) {
            this.searchResults = response.buildings;
            this.lastSearchQuery = this.searchQuery;
            
            // Initialize current building and pagination
            this.currentBuildingIndex = 0;
            this.navigationIndex = 1;
            this.currentBuilding = response.buildings[0];
            this.building = response.buildings[0]; // Auto-display first building
            
            // Start auto-hide timer for search message
            this.startSearchMessageTimer();
            
            this.clearMapMarkers();
            console.log('UPI search found buildings:', response.buildings.length);
            if (this.map) {
              this.displayMultipleBuildingsOnMap();
            }
          } else {
            this.showError(response.message || 'No buildings found for this UPI. Please verify the UPI and try again.');
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.loading = false;
          this.searchCompleted = true;
          this.showError('Search failed. Please check your connection and try again.');
          console.error('UPI search error:', error);
        }
      });
  }

  clearResults(): void {
    this.building = null;
    this.searchResults = [];
    this.lastSearchQuery = '';
    this.searchQuery = '';
    this.currentBuilding = null;
    this.currentBuildingIndex = 0;
    this.navigationIndex = 1;
    this.searchCompleted = false;
    this.hideSearchMessage();
    this.clearError();
    this.clearMapMarkers();
    
    // Clean up clicked building info
    this.clickedBuilding = null;
    if (this.clickedBuildingInfoWindow) {
      this.clickedBuildingInfoWindow.close();
      this.clickedBuildingInfoWindow = null;
    }
    
    if (this.map) {
      // Reset map to Kigali satellite view
      this.map.setCenter({ lat: -1.9441, lng: 30.0619 });
      this.map.setZoom(12);
      this.map.setMapTypeId('satellite');
    }
  }

  private clearMapMarkers(): void {
    // Clear existing markers
    this.buildingMarkers.forEach(marker => marker.setMap(null));
    this.buildingMarkers = [];
    
    // Clear existing polygons
    this.buildingPolygons.forEach(polygon => polygon.setMap(null));
    this.buildingPolygons = [];
  }

  private displayMultipleBuildingsOnMap(): void {
    if (!this.map || this.searchResults.length === 0) {
      console.log('Cannot display buildings: map or results missing');
      return;
    }

    console.log('Displaying', this.searchResults.length, 'buildings on map');
    const bounds = new window.google.maps.LatLngBounds();

    this.searchResults.forEach((building, index) => {
      const buildingCenter = {
        lat: building.latitude,
        lng: building.longitude
      };

      console.log(`Building ${index + 1}:`, buildingCenter);
      bounds.extend(buildingCenter);

      // Create a simple colored marker for each building
      const marker = new window.google.maps.Marker({
        position: buildingCenter,
        map: this.map,
        title: `Building ${index + 1}: ${building.building_id}`,
        label: {
          text: (index + 1).toString(),
          color: 'white',
          fontWeight: 'bold',
          fontSize: '12px'
        },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#dc2626',
          fillOpacity: 0.9,
          strokeWeight: 2,
          strokeColor: 'white'
        }
      });

      this.buildingMarkers.push(marker);

      // Add building footprint if available
      if (building.footprint && building.footprint.coordinates && building.footprint.coordinates[0]) {
        const polygonCoords = building.footprint.coordinates[0].map(coord => ({
          lat: coord[1],
          lng: coord[0]
        }));

        const polygon = new window.google.maps.Polygon({
          paths: polygonCoords,
          strokeColor: '#dc2626',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#dc2626',
          fillOpacity: 0.3,
          map: this.map
        });

        this.buildingPolygons.push(polygon);
      }

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-4 max-w-sm">
            <h3 class="font-bold text-gray-800 mb-2">Building #${index + 1}</h3>
            <div class="space-y-2 text-sm relative">
              <div class="bg-gray-100 p-2 rounded relative">
                <strong>ID</strong><br>
                <code class="text-xs">${building.building_id}</code>
                <button
                  onclick="copyBuildingIDToClipboard('${building.building_id}', this)"
                  class="group absolute top-2 right-2 text-blue-600 hover:underline text-xs cursor-pointer"
                >
                  <span class="icon-copy block relative">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                    </svg>
                    <span class="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">Copy</span>
                  </span>
                  <span class="icon-check hidden relative">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-green-600">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    <span class="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">Copied</span>
                  </span>
                </button>
              </div>
              <div><strong>Status:</strong> 
                <span class="px-2 py-1 rounded text-xs ${building.status === 'BUILT' ? 'bg-green-100 text-green-800' : building.status === 'UNDER_CONSTRUCTION' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}">
                  ${this.getStatusLabel(building.status)}
                </span>
              </div>
              <div><strong>Location:</strong> ${building.village}, ${building.cell}, ${building.sector}, ${building.district}, ${building.province}</div>
        
              ${building.parcel_id ? `<div><strong>UPI:</strong> <code>${building.parcel_id}</code></div>` : ''}
              <div class="flex gap-3 mt-4 justify-center">
                <button
                  onclick="openInGoogleMaps()"
                  class="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-md text-xs font-semibold shadow-sm transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400"
                  title="Open in Google Maps"
                  aria-label="Open in Google Maps"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <span>Open Maps</span>
                </button>
                <button
                  onclick="shareLocation()"
                  class="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-md text-xs font-semibold shadow-sm transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
                  title="Share Location"
                  aria-label="Share Location"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        `
      });

      marker.addListener('click', () => {
        console.log('Marker clicked for building:', building.building_id);
        
        // Close all other info windows
        this.buildingMarkers.forEach(m => {
          if (m.infoWindow) {
            m.infoWindow.close();
          }
        });
        
        // Store reference and open this one
        marker.infoWindow = infoWindow;
        infoWindow.open(this.map, marker);
        
        // Also update the sidebar with this building's info
        this.building = building;
      });
    });

    // Fit map to show all buildings
    if (bounds.isEmpty() === false) {
      this.map.fitBounds(bounds);
      
      // Add some padding and ensure reasonable zoom
      const listener = window.google.maps.event.addListener(this.map, 'idle', () => {
        if (this.map.getZoom() > 18) this.map.setZoom(18);
        if (this.map.getZoom() < 10) this.map.setZoom(10);
        window.google.maps.event.removeListener(listener);
      });
    }
  }

  selectBuilding(building: Building): void {
    this.building = building;
    
    // Update pagination if this is from UPI search results
    if (this.searchResults.length > 1) {
      const index = this.searchResults.findIndex(b => b.building_id === building.building_id);
      if (index !== -1) {
        this.currentBuildingIndex = index;
        this.navigationIndex = index + 1;
        this.currentBuilding = building;
      }
    }
    
    // Center map on selected building
    if (this.map) {
      this.map.setCenter({
        lat: building.latitude,
        lng: building.longitude
      });
      this.map.setZoom(19);
    }
  }

  centerOnAllBuildings(): void {
    if (this.map && this.searchResults.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      this.searchResults.forEach(building => {
        bounds.extend({
          lat: building.latitude,
          lng: building.longitude
        });
      });
      this.map.fitBounds(bounds);
    }
  }

  downloadUPIResults(): void {
    if (this.searchResults.length === 0) return;

    const upiData = {
      upi: this.lastSearchQuery,
      total_buildings: this.searchResults.length,
      search_date: new Date().toISOString(),
      buildings: this.searchResults.map(building => ({
        building_id: building.building_id,
        status: building.status,
        location: {
          province: building.province,
          district: building.district,
          sector: building.sector,
          cell: building.cell,
          village: building.village
        },
        coordinates: {
          latitude: building.latitude,
          longitude: building.longitude
        },
        parcel_id: building.parcel_id,
        data_source: building.data_source
      }))
    };

    const dataStr = JSON.stringify(upiData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `upi-search-${this.lastSearchQuery.replace(/\//g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  onMapClick(event: any): void {
    // Don't interfere with existing building info windows
    if (this.isLoading || this.isSearchingCoordinates) return;

    const clickedLat = event.latLng.lat();
    const clickedLng = event.latLng.lng();

    // Close any existing clicked building info window
    if (this.clickedBuildingInfoWindow) {
      this.clickedBuildingInfoWindow.close();
      this.clickedBuildingInfoWindow = null;
    }

    // Show loading indicator
    this.isSearchingCoordinates = true;

    // Search for building at clicked coordinates
    this.buildingsService.searchBuildingByCoordinates(clickedLat, clickedLng)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: CoordinateSearchResponse) => {
          this.isSearchingCoordinates = false;
          
          if (response.found && response.building) {
            this.showClickedBuildingInfo(response.building, clickedLat, clickedLng);
          } else {
            this.showNoBuildingFoundMessage(clickedLat, clickedLng);
          }
        },
        error: (error) => {
          this.isSearchingCoordinates = false;
          console.error('Coordinate search failed:', error);
          this.showSearchErrorMessage(clickedLat, clickedLng);
        }
      });
  }

  private showClickedBuildingInfo(building: Building, lat: number, lng: number): void {
    this.clickedBuilding = building;

    const infoWindowContent = `
      <div class="p-4 max-w-sm">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-3 h-3 rounded-full ${this.getStatusColor(building.status)}"></div>
          <h3 class="font-bold text-gray-800 text-sm">Clicked Building</h3>
        </div>
        
        <div class="space-y-2 text-sm">
          <div class="bg-gray-100 p-2 rounded relative">
            <strong>Building ID:</strong><br>
            <code class="text-xs">${building.building_id}</code>
            <button
              onclick="copyBuildingIDToClipboard('${building.building_id}', this)"
              class="group absolute top-2 right-2 text-blue-600 hover:underline text-xs cursor-pointer"
            >
              <span class="icon-copy block relative">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                </svg>
                <span class="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">Copy</span>
              </span>
              <span class="icon-check hidden relative">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-green-600">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span class="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">Copied</span>
              </span>
            </button>
          </div>
          
          <div><strong>Status:</strong> 
            <span class="px-2 py-1 rounded text-xs ${this.getStatusBadgeClass(building.status)}">
              ${this.getStatusLabel(building.status)}
            </span>
          </div>
          
          <div>
            <strong>Location:</strong>
            ${building.village}, ${building.cell}, ${building.sector}, ${building.district}, ${building.province}
          </div>
          
          ${building.parcel_id ? `<div><strong>UPI:</strong> <code class="text-xs">${building.parcel_id}</code></div>` : ''}
          
          <div class="text-xs text-gray-500 mt-2">
            Lat: ${building.latitude.toFixed(6)}, Lng: ${building.longitude.toFixed(6)}
          </div>
          
          <div class="mt-3 pt-2 border-t border-gray-200">
            <button onclick="window.parent.postMessage({type: 'viewBuildingDetails', buildingId: '${building.building_id}'}, '*')" 
                    class="w-full bg-blue-600 text-white py-1 px-2 rounded text-xs hover:bg-blue-700 transition-colors">
              View Full Details
            </button>
          </div>
        </div>
      </div>
    `;

    this.clickedBuildingInfoWindow = new window.google.maps.InfoWindow({
      content: infoWindowContent,
      position: { lat, lng }
    });

    this.clickedBuildingInfoWindow.open(this.map);

    // Listen for the view details message
    window.addEventListener('message', (event) => {
      if (event.data.type === 'viewBuildingDetails') {
        this.building = building;
        this.clickedBuildingInfoWindow?.close();
      }
    });
  }

  private showNoBuildingFoundMessage(lat: number, lng: number): void {
    const infoWindowContent = `
      <div class="p-3 text-center">
        <div class="text-gray-500 text-sm">
          <svg class="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p><strong>No Building Found</strong></p>
          <p class="text-xs">No registered building at this location</p>
          <p class="text-xs text-gray-400 mt-1">${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
        </div>
      </div>
    `;

    this.clickedBuildingInfoWindow = new window.google.maps.InfoWindow({
      content: infoWindowContent,
      position: { lat, lng }
    });

    this.clickedBuildingInfoWindow.open(this.map);

    // Auto-close after 3 seconds
    setTimeout(() => {
      if (this.clickedBuildingInfoWindow) {
        this.clickedBuildingInfoWindow.close();
        this.clickedBuildingInfoWindow = null;
      }
    }, 3000);
  }

  private showSearchErrorMessage(lat: number, lng: number): void {
    const infoWindowContent = `
      <div class="p-3 text-center">
        <div class="text-red-500 text-sm">
          <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p><strong>Search Error</strong></p>
          <p class="text-xs">Failed to search for building at this location</p>
        </div>
      </div>
    `;

    this.clickedBuildingInfoWindow = new window.google.maps.InfoWindow({
      content: infoWindowContent,
      position: { lat, lng }
    });

    this.clickedBuildingInfoWindow.open(this.map);

    // Auto-close after 3 seconds
    setTimeout(() => {
      if (this.clickedBuildingInfoWindow) {
        this.clickedBuildingInfoWindow.close();
        this.clickedBuildingInfoWindow = null;
      }
    }, 3000);
  }

  private getStatusColor(status: string): string {
    switch (status) {
      case 'BUILT': return 'bg-green-500';
      case 'UNDER_CONSTRUCTION': return 'bg-yellow-500';
      case 'PLANNED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }

  private getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'BUILT': return 'bg-green-100 text-green-800';
      case 'UNDER_CONSTRUCTION': return 'bg-yellow-100 text-yellow-800';
      case 'PLANNED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
} 