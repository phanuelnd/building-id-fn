import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-location-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col md:flex-row gap-4 mb-6">
      <div class="flex-1">
        <label class="block text-blue-700 font-semibold mb-1" for="province">Province</label>
        <select
          id="province"
          class="w-full p-2 rounded border border-blue-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition outline-none"
          [ngModel]="province"
          (ngModelChange)="provinceChange.emit($event)"
        >
          <option value="">All Provinces</option>
          <option *ngFor="let p of provinces" [value]="p">{{ p }}</option>
        </select>
      </div>
      <div class="flex-1">
        <label class="block text-blue-700 font-semibold mb-1" for="district">District</label>
        <select
          id="district"
          class="w-full p-2 rounded border border-blue-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition outline-none"
          [ngModel]="district"
          (ngModelChange)="districtChange.emit($event)"
        >
          <option value="">All Districts</option>
          <option *ngFor="let d of districts" [value]="d">{{ d }}</option>
        </select>
      </div>
      <div class="flex-1">
        <label class="block text-blue-700 font-semibold mb-1" for="sector">Sector</label>
        <select
          id="sector"
          class="w-full p-2 rounded border border-blue-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition outline-none"
          [ngModel]="sector"
          (ngModelChange)="sectorChange.emit($event)"
        >
          <option value="">All Sectors</option>
          <option *ngFor="let s of sectors" [value]="s">{{ s }}</option>
        </select>
      </div>
    </div>
  `,
})
export class LocationFiltersComponent {
  @Input() provinces: string[] = [];
  @Input() districts: string[] = [];
  @Input() sectors: string[] = [];
  @Input() province: string = '';
  @Input() district: string = '';
  @Input() sector: string = '';
  @Output() provinceChange = new EventEmitter<string>();
  @Output() districtChange = new EventEmitter<string>();
  @Output() sectorChange = new EventEmitter<string>();
} 