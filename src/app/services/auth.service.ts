import { Injectable,inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, throwError,tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../environments/environment.development';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'super_admin' | 'admin' | 'visitor';
  status: 'active' | 'pending' | 'inactive';
  last_login_at?: string;
  is_first_login: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  }

export interface LoginResponse {
  access_token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private apiUrl = `${environment.apiBaseUrl}/auth`;
  private readonly tokenKey = 'access_token';
  private readonly userKey = 'current_user';

  private currentUserSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(this.loadUserFromStorage());
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor() {
    const token = this.getToken();
    if(token && !this.isTokenExpired(token)) {
    
    }
    else if(token) {
      this.logout(); // Clear invalid token
    }

  } 

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.handleLoginSuccess(response);
      }),
      catchError(error => {
        console.error('Login failed', error);
        return throwError(() => new Error('Login failed. Please check your credentials.'));
      })
    );  
  }

  logout(): void {
    // Clear all stored user data
    localStorage.removeItem(this.tokenKey); // Clear token
    localStorage.removeItem(this.userKey); // Clear user data
    this.currentUserSubject.next(null); // Update current user observable
    this.router.navigate(['/login']);  // Redirect to login page
    
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

 getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

   isSuperAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'super_admin';
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin' || user?.role === 'super_admin';
  }

   getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`)
      .pipe(
        tap(user => {
          this.updateCurrentUser(user);
        })
      );
  }

   updateProfile(profileData: any): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, profileData)
      .pipe(
        tap(user => {
          this.updateCurrentUser(user);
        })
      );
  }

    private handleLoginSuccess(response: LoginResponse): void {
    // Store token and user data
    localStorage.setItem(this.tokenKey, response.access_token);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
    
    // Update current user
    this.currentUserSubject.next(response.user);
  }


   private loadUserFromStorage(): User | null {
    try {
      const userJson = localStorage.getItem(this.userKey);
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }

   private updateCurrentUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

   private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // Convert to milliseconds
      return Date.now() > expiry;
    } catch {
      return true; // If we can't parse the token, consider it expired
    }
  }
} 