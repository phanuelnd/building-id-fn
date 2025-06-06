import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Building } from '../models/building.model';

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

@Component({
  selector: 'app-map-view',
  standalone: true,
  template: `
    <div class="bg-white rounded-xl shadow-md p-8 flex flex-col items-center justify-center min-h-[300px] mb-8">
      <div class="text-blue-400 text-lg font-semibold mb-2">Map will appear here</div>
      <div class="text-blue-200">(Interactive map with building footprints coming soon)</div>
    </div>
  `,
})
export class MapViewComponent {
  @Input() buildings: Building[] = [];
  @Output() selectBuilding = new EventEmitter<Building>();
  @Output() boundsChange = new EventEmitter<MapBounds>();
} 