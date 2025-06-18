import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Building } from '../models/building.model';
import { environment } from '../environments/environment.development';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-building-map-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex bg-blue-50">
      <!-- Map Section (80%) -->
      <div class="flex-1 w-4/5 p-4">
        <div class="h-full bg-white rounded-xl shadow-lg overflow-hidden">
          <!-- Map Header -->
          <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
            <h2 class="text-xl font-semibold">Interactive Building Map</h2>
            <p class="text-blue-100 text-sm mt-1">Click on buildings to view details</p>
          </div>
          
          <!-- Map Container -->
          <div class="h-full p-4">
            <div class="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center relative">
              <!-- Placeholder Map -->
              <div class="text-center">
                <svg class="w-16 h-16 text-blue-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <p class="text-lg font-semibold text-blue-600">Interactive Map</p>
                <p class="text-gray-500 mt-2">Map integration coming soon</p>
                <p class="text-sm text-gray-400 mt-1">This will display building locations and footprints</p>
              </div>
              
              <!-- Sample building markers for demonstration -->
              <div class="absolute top-1/4 left-1/3">
                <button 
                  (click)="selectSampleBuilding(sampleBuildings[0])"
                  class="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg hover:scale-110 transition-transform"
                  title="Sample Building 1">
                </button>
              </div>
              <div class="absolute top-1/2 left-1/2">
                <button 
                  (click)="selectSampleBuilding(sampleBuildings[1])"
                  class="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg hover:scale-110 transition-transform"
                  title="Sample Building 2">
                </button>
              </div>
              <div class="absolute top-3/4 left-2/3">
                <button 
                  (click)="selectSampleBuilding(sampleBuildings[2])"
                  class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg hover:scale-110 transition-transform"
                  title="Sample Building 3">
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Building Details Panel (20%) -->
      <div class="w-1/5 p-4 pl-0">
        <div class="h-full bg-white rounded-xl shadow-lg overflow-hidden">
          <!-- Panel Header -->
          <div class="bg-gradient-to-r from-gray-600 to-gray-700 text-white p-4">
            <h3 class="text-lg font-semibold">Building Details</h3>
            <p class="text-gray-200 text-sm mt-1">
              {{ selectedBuilding ? 'Selected Building' : 'Select a building on the map' }}
            </p>
          </div>

          <!-- Building Details Content -->
          <div class="p-4 h-full overflow-y-auto">
            <div *ngIf="!selectedBuilding" class="text-center text-gray-500 mt-8">
              <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p class="text-sm">Click on a building marker to view its details</p>
            </div>

            <div *ngIf="selectedBuilding" class="space-y-4">
              <!-- Building ID Badge -->
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <p class="text-xs text-blue-600 font-medium uppercase tracking-wide">Building ID</p>
                <p class="text-lg font-bold text-blue-800">{{ selectedBuilding.building_id }}</p>
              </div>

              <!-- Status Badge -->
              <div class="text-center">
                <span [class]="'inline-block px-3 py-1 rounded-full text-xs font-medium ' + getStatusClass(selectedBuilding.status)">
                  {{ selectedBuilding.status }}
                </span>
              </div>

              <!-- Location Information -->
              <div class="space-y-3">
                <h4 class="text-sm font-semibold text-gray-800 border-b pb-1">Location</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-500">Province:</span>
                    <span class="font-medium">{{ selectedBuilding.province }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">District:</span>
                    <span class="font-medium">{{ selectedBuilding.district }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Sector:</span>
                    <span class="font-medium">{{ selectedBuilding.sector }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Cell:</span>
                    <span class="font-medium">{{ selectedBuilding.cell }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Village:</span>
                    <span class="font-medium">{{ selectedBuilding.village }}</span>
                  </div>
                </div>
              </div>

              <!-- Coordinates -->
              <div class="space-y-3">
                <h4 class="text-sm font-semibold text-gray-800 border-b pb-1">Coordinates</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-500">Latitude:</span>
                    <span class="font-medium font-mono">{{ selectedBuilding.latitude | number:'1.6-6' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Longitude:</span>
                    <span class="font-medium font-mono">{{ selectedBuilding.longitude | number:'1.6-6' }}</span>
                  </div>
                </div>
              </div>

              <!-- Additional Info -->
              <div class="space-y-3">
                <h4 class="text-sm font-semibold text-gray-800 border-b pb-1">Additional Info</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-500">Data Source:</span>
                    <span class="font-medium">{{ selectedBuilding.data_source }}</span>
                  </div>
                  <div *ngIf="selectedBuilding.parcel_id" class="flex justify-between">
                    <span class="text-gray-500">Parcel ID:</span>
                    <span class="font-medium">{{ selectedBuilding.parcel_id }}</span>
                  </div>
                  <div *ngIf="selectedBuilding.permit_id" class="flex justify-between">
                    <span class="text-gray-500">Permit ID:</span>
                    <span class="font-medium">{{ selectedBuilding.permit_id }}</span>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="pt-4 space-y-2">
                <button
                  (click)="loadBuildingDetails()"
                  [disabled]="loading"
                  class="w-full bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {{ loading ? 'Loading...' : 'Refresh Details' }}
                </button>
                <button
                  (click)="selectedBuilding = null"
                  class="w-full bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class BuildingMapViewComponent implements OnInit {
  private apiUrl = `${environment.apiBaseUrl}/buildings`;
  private http = inject(HttpClient);

  selectedBuilding: Building | null = null;
  loading = false;

  // Sample buildings for demonstration
  sampleBuildings: Building[] = [
    {
      id: 1,
      building_id: 'BLD-001',
      status: 'BUILT',
      province: 'Kigali City',
      district: 'Gasabo',
      sector: 'Kimisagara',
      cell: 'Rugenge',
      village: 'Amahoro',
      longitude: 30.0619,
      latitude: -1.9441,
      data_source: 'Survey',
      created_at: '2023-01-15T10:30:00Z',
      updated_at: '2023-06-20T14:45:00Z',
      footprint: {
        type: 'Polygon',
        coordinates: [[[30.0619, -1.9441], [30.0620, -1.9441], [30.0620, -1.9442], [30.0619, -1.9442], [30.0619, -1.9441]]]
      },
      parcel_id: 'PRC-001',
      permit_id: 'PRM-001'
    },
    {
      id: 2,
      building_id: 'BLD-002',
      status: 'UNDER_CONSTRUCTION',
      province: 'Kigali City',
      district: 'Nyarugenge',
      sector: 'Nyarugenge',
      cell: 'Rwampara',
      village: 'Biryogo',
      longitude: 30.0588,
      latitude: -1.9536,
      data_source: 'Drone',
      created_at: '2023-03-10T09:15:00Z',
      updated_at: '2023-07-05T16:20:00Z',
      footprint: {
        type: 'Polygon',
        coordinates: [[[30.0588, -1.9536], [30.0589, -1.9536], [30.0589, -1.9537], [30.0588, -1.9537], [30.0588, -1.9536]]]
      }
    },
    {
      id: 3,
      building_id: 'BLD-003',
      status: 'PLANNED',
      province: 'Kigali City',
      district: 'Kicukiro',
      sector: 'Niboye',
      cell: 'Nyarugunga',
      village: 'Kabuga',
      longitude: 30.1044,
      latitude: -1.9706,
      data_source: 'Satellite',
      created_at: '2023-05-22T11:00:00Z',
      updated_at: '2023-08-15T13:30:00Z',
      footprint: {
        type: 'Polygon',
        coordinates: [[[30.1044, -1.9706], [30.1045, -1.9706], [30.1045, -1.9707], [30.1044, -1.9707], [30.1044, -1.9706]]]
      },
      parcel_id: 'PRC-003'
    }
  ];

  ngOnInit() {
    // Initialize with first sample building
    this.selectedBuilding = this.sampleBuildings[0];
  }

  selectSampleBuilding(building: Building) {
    this.selectedBuilding = building;
  }

  loadBuildingDetails() {
    if (!this.selectedBuilding) return;

    this.loading = true;
    this.http.get<Building>(`${this.apiUrl}/building_id/${this.selectedBuilding.building_id}`)
      .pipe(
        catchError(() => {
          // Fallback to sample data if API fails
          return of(this.selectedBuilding);
        })
      )
      .subscribe(data => {
        this.loading = false;
        if (data) {
          this.selectedBuilding = data;
        }
      });
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'BUILT': 'bg-green-100 text-green-800',
      'UNDER_CONSTRUCTION': 'bg-yellow-100 text-yellow-800',
      'PLANNED': 'bg-blue-100 text-blue-800',
      'DEMOLISHED': 'bg-red-100 text-red-800',
      'UNKNOWN': 'bg-gray-100 text-gray-800'
    };
    return classes[status] || classes['UNKNOWN'];
  }
} 