import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Building } from '../models/building.model';
import { environment } from '../environments/environment.development';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-public-map-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-screen flex flex-col bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <button
            (click)="goBack()"
            class="flex items-center text-blue-600 hover:text-blue-700 transition-colors duration-200"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Search
          </button>
          <div class="h-6 w-px bg-gray-300"></div>
          <h1 class="text-xl font-bold text-gray-800">Building Location</h1>
        </div>
        <div class="flex items-center space-x-4">
          <span class="text-sm text-gray-500">{{ searchQuery }}</span>
          <button
            (click)="goToDashboard()"
            class="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
          >
            Access Dashboard
          </button>
        </div>
      </header>

      <!-- Main Content -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Map View (70%) -->
        <div class="flex-1 relative bg-gray-100">
          <div *ngIf="loading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <div class="text-center">
              <svg class="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p class="text-gray-600">Loading building location...</p>
            </div>
          </div>

          <div *ngIf="!loading && !building" class="absolute inset-0 flex items-center justify-center">
            <div class="text-center max-w-md mx-auto p-8">
              <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <h3 class="text-xl font-semibold text-gray-700 mb-2">Building Not Found</h3>
              <p class="text-gray-500 mb-4">
                No building found with the identifier "{{ searchQuery }}". Please check the UPI or Building ID and try again.
              </p>
              <button
                (click)="goBack()"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Try Another Search
              </button>
            </div>
          </div>

          <!-- Placeholder Map (Replace with actual map implementation) -->
          <div *ngIf="!loading && building" class="w-full h-full relative bg-green-50 flex items-center justify-center">
            <div class="text-center">
              <svg class="w-16 h-16 text-green-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p class="text-lg font-semibold text-green-700 mb-2">Building Located</p>
              <p class="text-green-600">{{ building?.province }}, {{ building?.district }}</p>
              <p class="text-sm text-green-500 mt-2">Interactive map will be implemented here</p>
            </div>
            
            <!-- Map Controls -->
            <div class="absolute top-4 right-4 space-y-2">
              <button class="bg-white shadow-lg rounded-lg p-2 hover:bg-gray-50 transition-colors duration-200">
                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              <button class="bg-white shadow-lg rounded-lg p-2 hover:bg-gray-50 transition-colors duration-200">
                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Information Panel (30%) -->
        <div class="w-96 bg-white shadow-xl border-l border-gray-200 overflow-y-auto">
          <div *ngIf="building" class="p-6">
            <!-- Building Header -->
            <div class="mb-6">
              <h2 class="text-2xl font-bold text-gray-800 mb-2">Building Details</h2>
              <div class="flex items-center text-sm text-gray-500">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ building.status }}
              </div>
            </div>

            <!-- Basic Information -->
            <div class="space-y-4 mb-6">
              <div class="bg-blue-50 rounded-lg p-4">
                <h3 class="font-semibold text-blue-900 mb-2">Identification</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-blue-700">Building ID:</span>
                    <span class="font-medium text-blue-900">{{ building.building_id }}</span>
                  </div>
                                     <div class="flex justify-between" *ngIf="building.parcel_id">
                     <span class="text-blue-700">Parcel ID:</span>
                     <span class="font-medium text-blue-900">{{ building.parcel_id }}</span>
                   </div>
                </div>
              </div>

              <!-- Location Information -->
              <div class="bg-green-50 rounded-lg p-4">
                <h3 class="font-semibold text-green-900 mb-2">Location</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-green-700">Province:</span>
                    <span class="font-medium text-green-900">{{ building.province }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-green-700">District:</span>
                    <span class="font-medium text-green-900">{{ building.district }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-green-700">Sector:</span>
                    <span class="font-medium text-green-900">{{ building.sector }}</span>
                  </div>
                </div>
              </div>

                             <!-- Coordinates -->
               <div class="bg-purple-50 rounded-lg p-4" *ngIf="building.latitude && building.longitude">
                 <h3 class="font-semibold text-purple-900 mb-2">Coordinates</h3>
                 <div class="space-y-2 text-sm">
                   <div class="flex justify-between">
                     <span class="text-purple-700">Latitude:</span>
                     <span class="font-medium text-purple-900 font-mono">{{ building.latitude || 'N/A' }}</span>
                   </div>
                   <div class="flex justify-between">
                     <span class="text-purple-700">Longitude:</span>
                     <span class="font-medium text-purple-900 font-mono">{{ building.longitude || 'N/A' }}</span>
                   </div>
                 </div>
               </div>

                             <!-- Additional Information -->
               <div class="bg-gray-50 rounded-lg p-4">
                 <h3 class="font-semibold text-gray-900 mb-2">Additional Information</h3>
                 <div class="space-y-2 text-sm">
                   <div class="flex justify-between" *ngIf="building.cell">
                     <span class="text-gray-600">Cell:</span>
                     <span class="font-medium text-gray-900">{{ building.cell }}</span>
                   </div>
                   <div class="flex justify-between" *ngIf="building.village">
                     <span class="text-gray-600">Village:</span>
                     <span class="font-medium text-gray-900">{{ building.village }}</span>
                   </div>
                   <div class="flex justify-between" *ngIf="building.data_source">
                     <span class="text-gray-600">Data Source:</span>
                     <span class="font-medium text-gray-900">{{ building.data_source }}</span>
                   </div>
                   <div class="flex justify-between" *ngIf="building.permit_id">
                     <span class="text-gray-600">Permit ID:</span>
                     <span class="font-medium text-gray-900">{{ building.permit_id }}</span>
                   </div>
                 </div>
               </div>
            </div>

            <!-- Actions -->
            <div class="border-t border-gray-200 pt-6 space-y-3">
              <button
                (click)="shareLocation()"
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share Location
              </button>
              
              <button
                (click)="goToDashboard()"
                class="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                View Full Dashboard
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="!loading && !building" class="p-6 text-center">
            <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p class="text-gray-500">No building information available</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PublicMapViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/buildings`;

  searchQuery = '';
  building: Building | null = null;
  loading = true;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.searchQuery = params['query'] || '';
      if (this.searchQuery) {
        this.loadBuilding();
      }
    });
  }

  private loadBuilding(): void {
    this.loading = true;
    
    // Try to search by building_id first
    this.http.get<Building>(`${this.apiUrl}/building_id/${this.searchQuery}`)
      .pipe(
        catchError((err) => {
          if (err.status === 404) {
            // If not found by building_id, try general search
            return this.http.get<{ data: Building[] }>(`${this.apiUrl}?search=${encodeURIComponent(this.searchQuery)}&limit=1`)
              .pipe(
                catchError(() => of({ data: [] }))
              );
          }
          return of(null);
        })
      )
      .subscribe({
        next: (response) => {
          if (response && (response as Building).building_id) {
            // Direct building response
            this.building = response as Building;
          } else if (response && (response as { data: Building[] }).data?.length > 0) {
            // Search response with results
            this.building = (response as { data: Building[] }).data[0];
          } else {
            this.building = null;
          }
        },
        error: () => {
          this.building = null;
        },
        complete: () => {
          this.loading = false;
        }
      });
  }



  shareLocation(): void {
    if (this.building && navigator.share) {
      navigator.share({
        title: `Building ${this.building.building_id}`,
        text: `Location: ${this.building.province}, ${this.building.district}, ${this.building.sector}`,
        url: window.location.href
      });
    } else if (this.building) {
      // Fallback: copy to clipboard
      const url = window.location.href;
      navigator.clipboard.writeText(url).then(() => {
        alert('Location URL copied to clipboard!');
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  goToDashboard(): void {
    this.router.navigate(['/login']);
  }
} 