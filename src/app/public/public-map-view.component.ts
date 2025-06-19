import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Building } from '../models/building.model';
import { BuildingsService } from '../services/buildings.service';
import { environment } from '../environments/environment';
import { Subject, takeUntil } from 'rxjs';

// Google Maps types
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

@Component({
  selector: 'app-public-map-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <!-- Enhanced Header -->
      <header class="bg-white shadow-lg border-b border-gray-200 px-6 py-4 z-10 relative">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button
              (click)="goBack()"
              class="flex items-center text-blue-600 hover:text-blue-700 transition-all duration-200 group"
            >
              <svg class="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Search
            </button>
            <div class="h-6 w-px bg-gray-300"></div>
            <div class="flex items-center space-x-3">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h1 class="text-xl font-bold text-gray-800">Building Location Map</h1>
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2 text-sm">
              <span class="text-gray-500">Building ID:</span>
              <code class="bg-gray-100 px-2 py-1 rounded font-mono text-gray-700">{{ searchQuery }}</code>
            </div>
            <div class="h-6 w-px bg-gray-300"></div>
            <button
              (click)="goToDashboard()"
              class="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
            >
              Admin Dashboard
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
          <div *ngIf="!loading && !building" class="absolute inset-0 flex items-center justify-center z-20">
            <div class="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl border border-gray-200">
              <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-gray-800 mb-4">Building Not Found</h3>
              <p class="text-gray-600 mb-6 leading-relaxed">
                We couldn't locate a building with the identifier <strong>"{{ searchQuery }}"</strong>. 
                Please verify the Building ID format and try again.
              </p>
              <div class="space-y-3">
                <button
                  (click)="goBack()"
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
          <div #mapContainer id="map" class="w-full h-full"></div>

          <!-- Map Controls -->
          <div *ngIf="!loading && building" class="absolute top-4 left-4 z-10 space-y-2">
            <!-- Map Type Toggle -->
            <div class="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              <button
                (click)="toggleMapType('roadmap')"
                [class.bg-blue-600]="currentMapType === 'roadmap'"
                [class.text-white]="currentMapType === 'roadmap'"
                [class.text-gray-700]="currentMapType !== 'roadmap'"
                class="px-4 py-2 text-sm font-medium transition-colors duration-200 hover:bg-blue-50 border-r border-gray-200"
              >
                Map
              </button>
              <button
                (click)="toggleMapType('satellite')"
                [class.bg-blue-600]="currentMapType === 'satellite'"
                [class.text-white]="currentMapType === 'satellite'"
                [class.text-gray-700]="currentMapType !== 'satellite'"
                class="px-4 py-2 text-sm font-medium transition-colors duration-200 hover:bg-blue-50"
              >
                Satellite
              </button>
            </div>

            <!-- Zoom Controls -->
            <div class="bg-white rounded-lg shadow-lg border border-gray-200 p-1">
              <button
                (click)="zoomIn()"
                class="block w-full p-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200 rounded"
                title="Zoom In"
              >
                <svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              <div class="border-t border-gray-200 my-1"></div>
              <button
                (click)="zoomOut()"
                class="block w-full p-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200 rounded"
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
              class="bg-white rounded-lg shadow-lg border border-gray-200 p-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
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
        <div class="w-96 bg-white shadow-2xl border-l border-gray-200 overflow-y-auto z-10" [class.hidden]="!building">
          <div *ngIf="building" class="h-full">
            <!-- Header -->
            <div class="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
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
                    class="w-full mt-2 text-xs bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200"
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
                (click)="shareLocation()"
                class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center font-medium"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share Location
              </button>
              
              <button
                (click)="downloadDetails()"
                class="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center font-medium"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Details
              </button>
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
  building: Building | null = null;
  loading = true;
  map: any;
  buildingMarker: any;
  buildingPolygon: any;
  currentMapType: 'roadmap' | 'satellite' = 'roadmap';

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.searchQuery = params['query'];
      this.loadBuilding();
    });
  }

  ngAfterViewInit(): void {
    this.loadGoogleMaps();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
      zoom: 17,
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

    // Update map when building is loaded
    if (this.building) {
      this.displayBuildingOnMap();
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

    // Add building marker
    this.buildingMarker = new window.google.maps.Marker({
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

    // Add building footprint if available
    if (this.building.footprint && this.building.footprint.coordinates && this.building.footprint.coordinates[0]) {
      const polygonCoords = this.building.footprint.coordinates[0].map(coord => ({
        lat: coord[1],
        lng: coord[0]
      }));

      this.buildingPolygon = new window.google.maps.Polygon({
        paths: polygonCoords,
        strokeColor: '#2563eb',
        strokeOpacity: 0.8,
        strokeWeight: 3,
        fillColor: '#2563eb',
        fillOpacity: 0.2,
        map: this.map
      });

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
            <div><strong>ID:</strong> ${this.building.building_id}</div>
            <div><strong>Status:</strong> ${this.getStatusLabel(this.building.status)}</div>
            <div><strong>Location:</strong> ${this.building.village}, ${this.building.cell}</div>
            <div><strong>District:</strong> ${this.building.district}</div>
          </div>
        </div>
      `
    });

    this.buildingMarker.addListener('click', () => {
      infoWindow.open(this.map, this.buildingMarker);
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

  shareLocation(): void {
    if (navigator.share && this.building) {
      navigator.share({
        title: `Building ${this.building.building_id}`,
        text: `View building location in ${this.building.village}, ${this.building.district}`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Location link copied to clipboard!');
      });
    }
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

  refreshSearch(): void {
    this.loadBuilding();
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  goToDashboard(): void {
    this.router.navigate(['/login']);
  }
} 