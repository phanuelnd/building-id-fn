import { Component, effect, signal } from '@angular/core';
import { BuildingsService, BuildingListResponse } from '../services/buildings.service';
import { Building } from '../models/building.model';
import { catchError, finalize } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  imports: [CommonModule, FormsModule],
})
export class DashboardComponent {
  public Math = Math;

  // Dashboard state
  buildings = signal<Building[]>([]);
  total = signal<number>(0);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Filter state (for signals)
  page = signal(1);
  limit = signal(20);
  sortBy = signal('id');
  sortDirection = signal<'ASC' | 'DESC'>('ASC');

  // Filter state (for ngModel binding)
  searchValue = '';
  statusFilterValue = '';
  parcelIdFilterValue = '';
  permitIdFilterValue = '';
  dateFromValue = '';
  dateToValue = '';

  // For detail modal
  selectedBuilding = signal<Building | null>(null);

  constructor(private service: BuildingsService) {
    effect(() => {
      this.fetchBuildings();
    });
  }

  fetchBuildings(): void {
    // Sync filter signals with ngModel values before fetching
    this.search.set(this.searchValue);
    this.statusFilter.set(this.statusFilterValue);
    this.parcelIdFilter.set(this.parcelIdFilterValue);
    this.permitIdFilter.set(this.permitIdFilterValue);
    this.dateFrom.set(this.dateFromValue);
    this.dateTo.set(this.dateToValue);

    this.loading.set(true);
    this.error.set(null);
    this.service
      .getBuildings({
        page: this.page(),
        limit: this.limit(),
        search: this.search(),
        statusFilter: this.statusFilter(),
        parcelIdFilter: this.parcelIdFilter(),
        permitIdFilter: this.permitIdFilter(),
        dateFrom: this.dateFrom(),
        dateTo: this.dateTo(),
        sortBy: this.sortBy(),
        sortDirection: this.sortDirection(),
      })
      .pipe(
        catchError(() => {
          this.error.set('Failed to load data.');
          return EMPTY;
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((res: BuildingListResponse) => {
        this.buildings.set(res.data);
        this.total.set(res.total);
      });
  }

  // Table/Filter Actions
  onSort(column: string): void {
    if (this.sortBy() === column) {
      this.sortDirection.set(this.sortDirection() === 'ASC' ? 'DESC' : 'ASC');
    } else {
      this.sortBy.set(column);
      this.sortDirection.set('ASC');
    }
    this.page.set(1);
    this.fetchBuildings();
  }

  onPageChange(newPage: number): void {
    this.page.set(newPage);
    this.fetchBuildings();
  }

  onLimitChange(newLimit: number): void {
    this.limit.set(newLimit);
    this.page.set(1);
    this.fetchBuildings();
  }

  onFilterChange(): void {
    this.page.set(1);
    this.fetchBuildings();
  }

  openDetail(building: Building): void {
    this.selectedBuilding.set(building);
  }

  closeDetail(): void {
    this.selectedBuilding.set(null);
  }

  // Signals for filter values (for internal use)
  private search = signal('');
  private statusFilter = signal('');
  private parcelIdFilter = signal('');
  private permitIdFilter = signal('');
  private dateFrom = signal('');
  private dateTo = signal('');
}
