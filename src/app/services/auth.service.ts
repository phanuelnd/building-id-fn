import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(this.loadUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {}

  private loadUserFromStorage(): User | null {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    // Return mock user for demo purposes
    return {
      id: '1',
      username: 'Admin',
      email: 'admin@mininfra.rw',
      role: 'admin'
    };
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  login(username: string, password: string): Observable<boolean> {
    // Mock login for demo purposes
    const mockUser: User = {
      id: '1',
      username: username,
      email: `${username}@example.com`,
      role: 'admin'
    };

    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    this.currentUserSubject.next(mockUser);
    
    return new BehaviorSubject(true).asObservable();
  }

  logout(): void {
    // Clear all stored user data
    localStorage.removeItem('currentUser');
    localStorage.removeItem('user_token');
    sessionStorage.clear();
    
    this.currentUserSubject.next(null);
  }

  lockScreen(): void {
    // For demo purposes, just show a message
    // In a real app, you might keep the user logged in but require re-authentication
    console.log('Screen locked - would require re-authentication');
  }
} 