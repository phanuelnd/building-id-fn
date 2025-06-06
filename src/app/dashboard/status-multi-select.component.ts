import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-multi-select',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-wrap gap-2 mb-6">
      <button
        *ngFor="let status of statuses"
        (click)="toggleStatus(status)"
        [class]="'px-4 py-2 rounded-full border font-semibold transition ' + (selectedStatuses.includes(status) ? 'bg-blue-600 text-white border-blue-700 shadow' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50')"
        [attr.aria-pressed]="selectedStatuses.includes(status)"
        type="button"
      >
        {{ status | titlecase }}
      </button>
    </div>
  `,
})
export class StatusMultiSelectComponent {
  @Input() statuses: string[] = [];
  @Input() selectedStatuses: string[] = [];
  @Output() selectionChange = new EventEmitter<string[]>();

  toggleStatus(status: string) {
    const idx = this.selectedStatuses.indexOf(status);
    if (idx > -1) {
      this.selectionChange.emit(this.selectedStatuses.filter(s => s !== status));
    } else {
      this.selectionChange.emit([...this.selectedStatuses, status]);
    }
  }
} 