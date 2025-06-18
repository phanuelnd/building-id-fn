import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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
import { environment } from '../environments/environment.development';

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
    // MapViewComponent,
  ],
  template: `
    <div class="min-h-screen bg-blue-50 flex flex-col">
      <header class="bg-white shadow-md py-6">
        <div class="w-full max-w-7xl mx-auto px-4">
          <h1 class="text-3xl md:text-4xl font-bold text-blue-700 tracking-tight mb-2">
            Building ID Dashboard
          </h1>
          <p class="text-base md:text-lg text-gray-600 font-medium">
            Welcome! Explore, search, and manage building data with ease.
          </p>
        </div>
      </header>
      <main class="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
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
        <!-- <app-map-view
          [buildings]="buildings"
          (selectBuilding)="onSelectBuilding($event)"
          (boundsChange)="onMapBoundsChange($event)"
        ></app-map-view> -->
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
        <app-toast-notifications
          [toasts]="toasts"
          (dismiss)="onDismissToast($event)"
        ></app-toast-notifications>
      </main>
      <footer class="bg-white text-blue-400 text-center py-4 text-xs shadow-inner">
        &copy; {{ currentYear }} Building Management. All rights reserved.
      </footer>

      <!-- Building Detail Modal -->
      <app-building-detail-modal
        *ngIf="selectedBuilding"
        [building]="selectedBuilding"
        (close)="selectedBuilding = null"
      ></app-building-detail-modal>
    </div>
  `,
})
export class DashboardLayoutComponent implements OnInit {
  private apiUrl = `${environment.apiBaseUrl}/buildings`;
  private searchSubject = new Subject<string>();
  public currentYear = new Date().getFullYear();

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

  private http = inject(HttpClient);

  constructor() {
    this.setupSearchDebounce();
  }

  ngOnInit() {
    this.loadInitialData();
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
          this.toasts.push({ 
            message: `Viewing details for building ${data.building_id}`, 
            type: 'info' 
          });
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
}
