import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mb-6 flex items-center gap-3">
      <div class="relative flex-1">
        <input
          type="text"
          class="w-full p-3 pl-10 rounded-lg border border-blue-300 bg-white text-blue-900 placeholder-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition outline-none shadow-sm"
          [placeholder]="placeholder"
          [ngModel]="value"
          (ngModelChange)="onInput($event)"
          aria-label="Search buildings"
        />
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
    </div>
  `,
})
export class SearchBarComponent {
  @Input() value: string = '';
  @Input() placeholder: string = 'Search by Building ID or Address';
  @Output() valueChange = new EventEmitter<string>();
  private debounceTimeout: any;

  onInput(val: string) {
    clearTimeout(this.debounceTimeout);
    this.debounceTimeout = setTimeout(() => {
      this.valueChange.emit(val);
    }, 300);
  }
} 