import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Building } from '../models/building.model';

@Component({
  selector: 'app-building-detail-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="onClose()">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 class="text-xl font-semibold text-gray-800">Building Details</h2>
          <button (click)="onClose()" class="text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Basic Information -->
            <div class="space-y-4">
              <h3 class="text-lg font-medium text-blue-700 border-b pb-2">Basic Information</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-500">Building ID</p>
                  <p class="font-medium">{{ building.building_id }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Status</p>
                  <p class="font-medium">
                    <span [class]="'px-2 py-1 rounded-full text-xs font-medium ' + getStatusClass(building.status)">
                      {{ building.status }}
                    </span>
                  </p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Parcel ID</p>
                  <p class="font-medium">{{ building.parcel_id || 'N/A' }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Permit ID</p>
                  <p class="font-medium">{{ building.permit_id || 'N/A' }}</p>
                </div>
              </div>
            </div>

            <!-- Location Information -->
            <div class="space-y-4">
              <h3 class="text-lg font-medium text-blue-700 border-b pb-2">Location</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-500">Province</p>
                  <p class="font-medium">{{ building.province }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">District</p>
                  <p class="font-medium">{{ building.district }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Sector</p>
                  <p class="font-medium">{{ building.sector }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Cell</p>
                  <p class="font-medium">{{ building.cell }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Village</p>
                  <p class="font-medium">{{ building.village }}</p>
                </div>
              </div>
            </div>

            <!-- Coordinates -->
            <div class="space-y-4">
              <h3 class="text-lg font-medium text-blue-700 border-b pb-2">Coordinates</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-500">Latitude</p>
                  <p class="font-medium">{{ building.latitude }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Longitude</p>
                  <p class="font-medium">{{ building.longitude }}</p>
                </div>
              </div>
            </div>

            <!-- Additional Information -->
            <div class="space-y-4">
              <h3 class="text-lg font-medium text-blue-700 border-b pb-2">Additional Information</h3>
              <div class="grid grid-cols-1 gap-4">
                <div>
                  <p class="text-sm text-gray-500">Data Source</p>
                  <p class="font-medium">{{ building.data_source }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Created At</p>
                  <p class="font-medium">{{ building.created_at | date:'medium' }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Updated At</p>
                  <p class="font-medium">{{ building.updated_at | date:'medium' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
          <button (click)="onClose()" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Close
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class BuildingDetailModalComponent {
  @Input() building!: Building;
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
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