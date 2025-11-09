import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TitleCasePipe],
  template: `
    <div class="app-shell" *ngIf="vm() as vm">
      <aside class="side-nav">
        <h2>Fullstack Starter</h2>
        <p class="badge">{{ vm.role | titlecase }}</p>
        <nav>
          <ul>
            <li><a routerLink="/dashboard" routerLinkActive="active">Dashboard</a></li>
            <li *ngIf="vm.role !== 'guest'"><a routerLink="/projects" routerLinkActive="active">Projects</a></li>
            <li *ngIf="vm.role === 'admin'"><a routerLink="/tasks" routerLinkActive="active">Tasks</a></li>
          </ul>
        </nav>
        <button class="secondary" (click)="logout()" *ngIf="vm.authenticated">Sign out</button>
      </aside>
      <main>
        <router-outlet />
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private auth = inject(AuthService);

  readonly vm = computed(() => ({
    authenticated: this.auth.isAuthenticated(),
    role: this.auth.currentUser()?.role ?? 'guest'
  }));

  logout(): void {
    this.auth.logout();
  }
}
