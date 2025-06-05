import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-pagination-controls',
  standalone: true,
  template: `
    <div class="flex items-center gap-2">
      <button
        [disabled]="page === 1"
        (click)="pageChange.emit(1)"
        class="px-3 py-1 border border-blue-300 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        First
      </button>
      <button
        [disabled]="page === 1"
        (click)="pageChange.emit(page - 1)"
        class="px-3 py-1 border border-blue-300 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Prev
      </button>
      <span class="mx-2 text-blue-900">
        Page <span class="font-semibold text-blue-700">{{ page }}</span> /
        <span class="font-semibold text-blue-700">{{ totalPages }}</span>
      </span>
      <button
        [disabled]="page >= totalPages"
        (click)="pageChange.emit(page + 1)"
        class="px-3 py-1 border border-blue-300 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
      <button
        [disabled]="page >= totalPages"
        (click)="pageChange.emit(totalPages)"
        class="px-3 py-1 border border-blue-300 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Last
      </button>
    </div>
  `,
})
export class PaginationControlsComponent {
  @Input() page: number = 1;
  @Input() totalPages: number = 1;
  @Output() pageChange = new EventEmitter<number>();
} 