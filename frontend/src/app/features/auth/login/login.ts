import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '@core/services/auth.service';
import { Button } from '@shared/ui/button/button';
import { InputComponent } from '@shared/ui/input/input';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, Button, InputComponent],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  /** What went wrong with the last attempt, shown above the button. */
  readonly errorMessage = signal<string | null>(null);

  /** Set by the sign-up page after creating an account. */
  readonly justRegistered = signal(history.state?.['registered'] === true);

  readonly loginForm = this.fb.nonNullable.group({
    email: [
      (history.state?.['email'] as string | undefined) ?? '',
      [Validators.required, Validators.email],
    ],
    password: ['', Validators.required],
  });

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.justRegistered.set(false);

    this.authService
      .login(this.loginForm.getRawValue())
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(this.describe(error));
        },
      });
  }

  private describe(error: HttpErrorResponse): string {
    switch (error.status) {
      case 401:
        return 'Incorrect email or password.';
      case 429:
        return 'Too many attempts. Wait a moment and try again.';
      case 0:
        return "Can't reach Cadence. Check your connection and try again.";
      default:
        return 'Something went wrong. Please try again.';
    }
  }
}
