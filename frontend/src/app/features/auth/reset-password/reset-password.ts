import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideArrowLeft } from '@lucide/angular';
import { finalize } from 'rxjs';

import { AuthService } from '@core/services/auth.service';
import { Button } from '@shared/ui/button/button';
import { InputComponent } from '@shared/ui/input/input';
import { MIN_PASSWORD_LENGTH, passwordsMatchValidator } from '../register/register';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, InputComponent, Button, LucideArrowLeft, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly accessToken = this.getRecoveryAccessToken();

  readonly minPasswordLength = MIN_PASSWORD_LENGTH;
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  /** No token in the link, or the server rejected it: the only way forward is a new link. */
  readonly linkExpired = signal(this.accessToken === null);

  readonly resetPasswordForm = this.formBuilder.nonNullable.group(
    {
      password: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)]],
      confirmPassword: ['', Validators.required],
    },
    {
      validators: passwordsMatchValidator,
    },
  );

  constructor() {
    this.resetPasswordForm.controls.password.valueChanges.subscribe(() => {
      this.resetPasswordForm.updateValueAndValidity({ emitEvent: false });
    });
  }

  navigateToForgotPassword(): void {
    this.router.navigate(['/forgot-password'], {
      replaceUrl: true,
    });
  }

  submit(): void {
    if (this.resetPasswordForm.invalid || !this.accessToken) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const { password } = this.resetPasswordForm.getRawValue();

    this.authService
      .resetPassword({
        access_token: this.accessToken,
        password,
      })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/login'], {
            replaceUrl: true,
          });
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 401) {
            this.linkExpired.set(true);
            return;
          }

          this.errorMessage.set(
            error.status === 0
              ? "Can't reach Cadence. Check your connection and try again."
              : "Couldn't update your password. Please try again.",
          );
        },
      });
  }

  private getRecoveryAccessToken(): string | null {
    const fragment = window.location.hash.substring(1);

    return new URLSearchParams(fragment).get('access_token');
  }
}
