import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Building } from '../models/building.model';

@Component({
  selector: 'app-buildings-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overflow-x-auto rounded shadow border border-blue-100">
      <table class="min-w-full text-sm text-left bg-white">
        <thead>
          <tr class="bg-blue-50 border-b border-blue-100">
            <th
              *ngFor="let col of columns"
              class="p-3 font-bold cursor-pointer text-blue-800 hover:bg-blue-100 transition"
              (click)="sort.emit(col.key)"
            >
              {{ col.label }}
              <span *ngIf="sortBy === col.key">
                <span *ngIf="sortDirection === 'ASC'" class="text-blue-600">&#8593;</span>
                <span *ngIf="sortDirection === 'DESC'" class="text-blue-600">&#8595;</span>
              </span>
            </th>
            <th class="p-3 font-bold text-blue-800">View</th>
          </tr>
        </thead>
        <tbody>
          <tr
            *ngFor="let b of buildings; let i = index"
            [class]="i % 2 === 0 ? 'bg-white' : 'bg-blue-50'"
            [ngClass]="['hover:bg-blue-100', 'transition', 'cursor-pointer']"
          >
            <td *ngFor="let col of columns" class="p-3 border-b border-blue-50">
              {{ getCellValue(b, col.key) }}
            </td>
            <td class="p-3 border-b border-blue-50">
              <button
                (click)="viewDetail.emit(b)"
                class="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded transition font-medium shadow-sm"
              >
                View
              </button>
            </td>
          </tr>
          <tr *ngIf="loading">
            <td [attr.colspan]="columns.length + 1" class="p-6 text-center text-blue-400 bg-blue-50">Loading...</td>
          </tr>
          <tr *ngIf="error">
            <td [attr.colspan]="columns.length + 1" class="p-6 text-center text-red-500 bg-blue-50">{{ error }}</td>
          </tr>
          <tr *ngIf="!loading && !error && buildings.length === 0">
            <td [attr.colspan]="columns.length + 1" class="p-6 text-center text-blue-400 bg-blue-50">No data found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
})
export class BuildingsTableComponent {
  @Input() buildings: Building[] = [];
  @Input() columns: { key: string; label: string }[] = [];
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() sortBy: string = '';
  @Input() sortDirection: 'ASC' | 'DESC' = 'ASC';
  @Output() sort = new EventEmitter<string>();
  @Output() viewDetail = new EventEmitter<Building>();

  getCellValue(building: Building, key: string): string {
    return building[key as keyof Building]?.toString() ?? '';
  }
} 