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
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
      <div
        class="bg-white rounded-xl shadow-md p-6 flex flex-col items-center cursor-pointer border-t-4 border-blue-600 hover:shadow-lg transition"
        (click)="filterByStatus.emit('ALL')"
        tabindex="0"
        role="button"
        aria-label="Show all buildings"
      >
        <div class="text-4xl font-extrabold text-blue-700">{{ stats?.total ?? 0 }}</div>
        <div class="text-blue-500 font-semibold mt-2">Total Buildings</div>
      </div>
      <ng-container *ngFor="let status of statusKeys">
        <div
          class="bg-white rounded-xl shadow-md p-6 flex flex-col items-center cursor-pointer border-t-4 border-blue-400 hover:shadow-lg transition"
          (click)="filterByStatus.emit(status)"
          tabindex="0"
          role="button"
          [attr.aria-label]="'Show ' + status + ' buildings'"
        >
          <div class="text-4xl font-extrabold text-blue-600">{{ getStatusCount(status) }}</div>
          <div class="text-blue-400 font-semibold mt-2">{{ status | titlecase }}</div>
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