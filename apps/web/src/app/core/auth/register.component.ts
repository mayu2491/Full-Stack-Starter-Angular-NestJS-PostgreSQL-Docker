import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  standalone: true,
  selector: 'app-register',
  template: `
    <div class="card">
      <h1>Create your account</h1>
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="form-grid">
          <label>
            Name
            <input type="text" formControlName="name" />
          </label>
          <label>
            Email
            <input type="email" formControlName="email" />
          </label>
        </div>
        <label>
          Password
          <input type="password" formControlName="password" />
        </label>
        <button type="submit" [disabled]="form.invalid">Register</button>
      </form>
      <p>Already registered? <a routerLink="/auth/login">Sign in</a></p>
    </div>
  `,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.auth.register(this.form.getRawValue());
  }
}
