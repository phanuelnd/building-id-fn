import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logout-confirmation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex items-center justify-center bg-blue-50">
      <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
        <!-- Icon -->
        <div class="text-center mb-6">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg class="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Confirm Logout</h2>
          <p class="text-gray-600">Are you sure you want to sign out of your account?</p>
        </div>

        <!-- Session Info -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <div class="text-sm space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-500">Current Session:</span>
              <span class="font-medium">Active</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Last Activity:</span>
              <span class="font-medium">{{ getCurrentTime() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Session Duration:</span>
              <span class="font-medium">{{ getSessionDuration() }}</span>
            </div>
          </div>
        </div>

        <!-- Warning -->
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div class="flex">
            <svg class="h-5 w-5 text-yellow-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div class="text-sm">
              <p class="text-yellow-800 font-medium">Important Notice</p>
              <p class="text-yellow-700 mt-1">Any unsaved changes will be lost. Make sure to save your work before logging out.</p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3">
          <button
            (click)="onCancel()"
            class="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Cancel
          </button>
          <button
            (click)="onConfirmLogout()"
            class="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Sign Out
          </button>
        </div>

        <!-- Additional Options -->
        <div class="mt-6 pt-6 border-t border-gray-200">
          <div class="text-center">
            <button
              (click)="onLockScreen()"
              class="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Lock Screen Instead
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LogoutConfirmationComponent {
  @Output() cancel = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
  @Output() lockScreen = new EventEmitter<void>();

  private sessionStartTime = new Date();

  onCancel() {
    this.cancel.emit();
  }

  onConfirmLogout() {
    // Perform logout logic here
    this.performLogout();
  }

  onLockScreen() {
    this.lockScreen.emit();
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  getSessionDuration(): string {
    const now = new Date();
    const diffMs = now.getTime() - this.sessionStartTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  }

  private performLogout() {
    // Clear any stored user data, tokens, etc.
    localStorage.removeItem('user_token');
    sessionStorage.clear();
    
    // Show logout success message briefly before redirect
    this.showLogoutSuccess();
  }

  private showLogoutSuccess() {
    // Create a temporary success overlay
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    overlay.innerHTML = `
      <div class="bg-white rounded-2xl shadow-xl p-8 max-w-sm mx-4 text-center">
        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Logged Out Successfully</h3>
        <p class="text-gray-600 text-sm">You have been securely signed out. Redirecting...</p>
      </div>
    `;
    
    document.body.appendChild(overlay);

    // Remove overlay and emit logout after delay
    setTimeout(() => {
      document.body.removeChild(overlay);
      this.logout.emit();
    }, 2000);
  }
} 