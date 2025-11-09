import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  template: `
    <div class="card">
      <h1>Sign in</h1>
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="form-grid">
          <label>
            Email
            <input type="email" formControlName="email" />
          </label>
          <label>
            Password
            <input type="password" formControlName="password" />
          </label>
        </div>
        <label>
          <input type="checkbox" formControlName="rememberMe" /> Remember me
        </label>
        <button type="submit" [disabled]="form.invalid">Continue</button>
      </form>
      <p>Need an account? <a routerLink="/auth/register">Create one</a></p>
    </div>
  `,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    rememberMe: [true]
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.auth.login(this.form.getRawValue());
  }
}
