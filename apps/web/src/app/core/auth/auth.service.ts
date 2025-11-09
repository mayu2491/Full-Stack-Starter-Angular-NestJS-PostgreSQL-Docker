import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthResponse, Role, SessionUser } from '@fullstack/types';
import { environment } from '../../../environments/environment';
import { Observable, catchError, tap, throwError } from 'rxjs';

type AuthState = {
  user: SessionUser | null;
  tokens: AuthResponse['tokens'] | null;
};

const ACCESS_KEY = 'fullstack.access';
const REFRESH_KEY = 'fullstack.refresh';
const USER_KEY = 'fullstack.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly state = signal<AuthState>({ user: null, tokens: null });

  private readonly authenticated = computed(() => !!this.state().tokens?.accessToken);

  private get hasWindow() {
    return typeof window !== 'undefined';
  }

  constructor() {
    this.restoreSession();
    effect(() => {
      if (!this.hasWindow) {
        return;
      }
      const snapshot = this.state();
      if (snapshot.tokens?.accessToken) {
        localStorage.setItem(ACCESS_KEY, snapshot.tokens.accessToken);
        localStorage.setItem(REFRESH_KEY, snapshot.tokens.refreshToken);
        localStorage.setItem(USER_KEY, JSON.stringify(snapshot.user));
      } else {
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
        localStorage.removeItem(USER_KEY);
      }
    });
  }

  isAuthenticated(): boolean {
    return this.authenticated();
  }

  currentUser(): SessionUser | null {
    return this.state().user;
  }

  role(): Role {
    return this.state().user?.role ?? 'guest';
  }

  accessToken(): string | null {
    return this.state().tokens?.accessToken ?? null;
  }

  login(payload: { email: string; password: string; rememberMe: boolean }) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, payload)
      .pipe(
        tap((res) => {
          this.state.set({ user: { ...res.user, rememberMe: payload.rememberMe }, tokens: res.tokens });
          this.router.navigateByUrl('/dashboard');
        })
      )
      .subscribe();
  }

  register(payload: { email: string; password: string; name: string }) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, payload)
      .pipe(
        tap((res) => {
          this.state.set({ user: res.user, tokens: res.tokens });
          this.router.navigateByUrl('/dashboard');
        })
      )
      .subscribe();
  }

  refresh(): Observable<AuthResponse> {
    if (!this.hasWindow) {
      return throwError(() => new Error('Refresh unavailable'));
    }

    const refreshToken = localStorage.getItem(REFRESH_KEY);
    if (!refreshToken) {
      return throwError(() => new Error('Missing refresh token'));
    }

    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(
        tap((res) => this.state.set({ user: res.user, tokens: res.tokens })),
        catchError((error) => {
          this.logout();
          return throwError(() => error);
        })
      );
  }

  logout() {
    this.state.set({ user: null, tokens: null });
    if (this.hasWindow) {
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem(USER_KEY);
    }
    this.router.navigate(['/auth/login']);
  }

  private restoreSession() {
    if (!this.hasWindow) {
      return;
    }

    try {
      const userRaw = localStorage.getItem(USER_KEY);
      const access = localStorage.getItem(ACCESS_KEY);
      const refresh = localStorage.getItem(REFRESH_KEY);
      if (!userRaw || !access || !refresh) {
        return;
      }
      const user = JSON.parse(userRaw) as SessionUser;
      this.state.set({
        user,
        tokens: {
          accessToken: access,
          refreshToken: refresh,
          expiresAt: Date.now() + 1000 * 60 * 15
        }
      });
    } catch (error) {
      console.warn('Failed to restore session', error);
      this.logout();
    }
  }
}
