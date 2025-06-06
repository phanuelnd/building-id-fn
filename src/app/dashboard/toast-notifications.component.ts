import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
}

@Component({
  selector: 'app-toast-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-6 right-6 z-50 flex flex-col gap-3">
      <div
        *ngFor="let toast of toasts; let i = index"
        class="px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 text-white animate-fade-in"
        [ngClass]="{
          'bg-blue-600': toast.type === 'info',
          'bg-green-600': toast.type === 'success',
          'bg-red-600': toast.type === 'error'
        }"
        role="alert"
        aria-live="assertive"
      >
        <span class="flex-1">{{ toast.message }}</span>
        <button
          (click)="dismiss.emit(i)"
          class="ml-4 text-white hover:text-blue-200 focus:outline-none"
          aria-label="Dismiss notification"
        >
          &times;
        </button>
      </div>
    </div>
    <style>
      @keyframes fade-in {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in {
        animation: fade-in 0.3s cubic-bezier(0.4,0,0.2,1);
      }
    </style>
  `,
})
export class ToastNotificationsComponent {
  @Input() toasts: Toast[] = [];
  @Output() dismiss = new EventEmitter<number>();
} 