import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import type {
  AuthResponse,
  LoginDto,
  RegisterDto,
  User,
} from '@oinkbooks/types';

import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'oink_token';
const USER_KEY = 'oink_user';

/**
 * v2 replacement for v1's React `UserContext` + `useUserData` hook.
 * A `root`-provided service is Angular's idiom for app-wide shared state:
 * inject it anywhere instead of wrapping the tree in a Context.Provider.
 *
 * `currentUser` is a signal (the `useState` equivalent); `isAuthenticated`
 * is a `computed` derived from it (the `useMemo` equivalent).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly base = `${environment.apiUrl}/auth`;

  readonly currentUser = signal<User | null>(this.restoreUser());
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  register(dto: RegisterDto): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.base}/register`, dto)
      .pipe(tap((res) => this.startSession(res)));
  }

  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.base}/login`, dto)
      .pipe(tap((res) => this.startSession(res)));
  }

  /** Debounced by the register form to surface username availability (v1 parity). */
  checkUsername(username: string): Observable<{ available: boolean }> {
    return this.http.get<{ available: boolean }>(
      `${this.base}/username-available`,
      { params: { username } },
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
    void this.router.navigate(['/login']);
  }

  private startSession(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.currentUser.set(res.user);
  }

  private restoreUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw || !localStorage.getItem(TOKEN_KEY)) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
