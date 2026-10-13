import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft } from '@lucide/angular';
import { finalize } from 'rxjs';

import { AuthService } from '@core/services/auth.service';
import { Button } from '@shared/ui/button/button';
import { InputComponent } from '@shared/ui/input/input';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink, Button, InputComponent, LucideArrowLeft],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly isSubmitting = signal(false);
  readonly emailSentMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly forgotPasswordForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  submit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const { email } = this.forgotPasswordForm.getRawValue();

    this.authService
      .forgotPassword({ email })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (response) => {
          this.emailSentMessage.set(
            response?.message || 'If that address has an account, a reset link is on its way.',
          );
          this.forgotPasswordForm.controls.email.disable();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(
            error.status === 429
              ? 'Too many requests. Wait a moment and try again.'
              : error.status === 0
                ? "Can't reach Cadence. Check your connection and try again."
                : "Couldn't send the reset link. Please try again.",
          );
        },
      });
  }
}
