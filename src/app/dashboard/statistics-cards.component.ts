import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface BuildingStats {
  total: number;
  byStatus: { [status: string]: number };
}

@Component({
  selector: 'app-statistics-cards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
      <div
        class="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg p-8 flex flex-col items-center cursor-pointer border border-blue-200 hover:from-blue-100 hover:to-white hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
        (click)="filterByStatus.emit('ALL')"
        tabindex="0"
        role="button"
        aria-label="Show all buildings"
      >
        <div class="text-5xl font-black text-blue-800 group-hover:text-blue-900 transition-colors duration-200">
          {{ stats?.total ?? 0 }}
        </div>
        <div class="text-base font-semibold text-blue-600 mt-3 tracking-wide uppercase group-hover:text-blue-800 transition-colors duration-200">
          Total Buildings
        </div>
        <div class="mt-4 w-10 h-1 rounded-full bg-blue-300 group-hover:bg-blue-500 transition-colors duration-200"></div>
      </div>
      <ng-container *ngFor="let status of statusKeys">
        <div
          class="group bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg p-8 flex flex-col items-center cursor-pointer border border-blue-100 hover:from-blue-50 hover:to-white hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
          (click)="filterByStatus.emit(status)"
          tabindex="0"
          role="button"
          [attr.aria-label]="'Show ' + status + ' buildings'"
        >
          <div class="text-5xl font-black text-blue-700 group-hover:text-blue-900 transition-colors duration-200">
            {{ getStatusCount(status) }}
          </div>
          <div class="text-base font-semibold text-blue-500 mt-3 tracking-wide uppercase group-hover:text-blue-700 transition-colors duration-200">
            {{ status | titlecase }}
          </div>
          <div class="mt-4 w-10 h-1 rounded-full bg-blue-200 group-hover:bg-blue-400 transition-colors duration-200"></div>
        </div>
      </ng-container>
    </div>
  `,
})
export class StatisticsCardsComponent {
  @Input() stats: BuildingStats | null = null;
  @Output() filterByStatus = new EventEmitter<string>();

  get statusKeys(): string[] {
    return this.stats ? Object.keys(this.stats.byStatus) : [];
  }

  getStatusCount(status: string): number {
    return this.stats?.byStatus?.[status] ?? 0;
  }
} 