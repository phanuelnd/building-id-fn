import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination-controls',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-3 px-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <!-- Page Size Selector -->
      <div class="flex items-center gap-2">
        <label for="pageSize" class="text-sm text-gray-700 font-medium">Rows per page</label>
        <select
          id="pageSize"
          [ngModel]="pageSize"
          (ngModelChange)="onPageSizeChange($event)"
          class="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          aria-label="Rows per page"
        >
          <option *ngFor="let size of pageSizes" [value]="size">{{ size }}</option>
        </select>
      </div>

      <!-- Pagination Controls -->
      <div class="flex items-center gap-1">
        <button
          type="button"
          (click)="onPageChange(1)"
          [disabled]="page === 1"
          class="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition disabled:text-gray-300 disabled:bg-transparent"
          aria-label="First page"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <polyline points="19 19 5 12 19 5"/>
          </svg>
        </button>
        <button
          type="button"
          (click)="onPageChange(+page - 1)"
          [disabled]="page === 1"
          class="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition disabled:text-gray-300 disabled:bg-transparent"
          aria-label="Previous page"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <polyline points="15 19 8 12 15 5"/>
          </svg>
        </button>
        <span class="mx-2 text-sm text-gray-700 select-none min-w-[90px] text-center">
          Page <span class="font-semibold">{{ page }}</span> of <span class="font-semibold">{{ totalPages }}</span>
        </span>
        <button
          type="button"
          (click)="onPageChange(+page + 1)"
          [disabled]="page === totalPages"
          class="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition disabled:text-gray-300 disabled:bg-transparent"
          aria-label="Next page"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <polyline points="9 5 16 12 9 19"/>
          </svg>
        </button>
        <button
          type="button"
          (click)="onPageChange(totalPages)"
          [disabled]="page === totalPages"
          class="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition disabled:text-gray-300 disabled:bg-transparent"
          aria-label="Last page"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <polyline points="5 5 19 12 5 19"/>
          </svg>
        </button>
      </div>
    </div>
  `
})
export class PaginationControlsComponent implements OnChanges {
  @Input() page = 1;
  @Input() totalPages = 1;
  @Input() pageSize = 5;
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  readonly pageSizes = [5, 10, 15, 20, 40];

  ngOnChanges(changes: SimpleChanges): void {
    // Ensure page and totalPages are always numbers when inputs change
    if (changes['page']) {
      this.page = Number(this.page);
      console.log('PaginationControlsComponent: page input changed to', this.page);
    }
    if (changes['totalPages']) {
      this.totalPages = Number(this.totalPages);
      console.log('PaginationControlsComponent: totalPages input changed to', this.totalPages);
    }
    if (changes['pageSize']) {
      this.pageSize = Number(this.pageSize);
      console.log('PaginationControlsComponent: pageSize input changed to', this.pageSize);
    }
  }

  onPageChange(newPage: number): void {
    console.log(`PaginationControlsComponent: onPageChange triggered. Current page: ${this.page}, New page proposed: ${newPage}, Total pages: ${this.totalPages}`);
    // Emit the page change if the new page is within valid bounds.
    // The parent component will handle preventing redundant loads if newPage === this.page.
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.pageChange.emit(newPage);
      console.log('PaginationControlsComponent: Emitting pageChange event for page', newPage);
    }
  }

  onPageSizeChange(newSize: number): void {
    console.log('PaginationControlsComponent: onPageSizeChange triggered. New size:', newSize);
    this.pageSizeChange.emit(Number(newSize));
  }
}