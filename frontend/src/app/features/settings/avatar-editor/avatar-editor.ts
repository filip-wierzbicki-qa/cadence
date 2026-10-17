import { Component, computed, inject, input, output, signal } from '@angular/core';
import { finalize, Observable, switchMap } from 'rxjs';

import { AuthService } from '@core/services/auth.service';
import { AvatarService } from '@core/services/avatar.service';
import { Button } from '@shared/ui/button/button';
import { Modal } from '@shared/ui/modal/modal';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 2 * 1024 * 1024;

@Component({
  selector: 'app-avatar-editor',
  imports: [Modal, Button],
  templateUrl: './avatar-editor.html',
  styleUrl: './avatar-editor.scss',
})
export class AvatarEditor {
  private readonly authService = inject(AuthService);
  private readonly avatarService = inject(AvatarService);

  readonly open = input(false);
  readonly closed = output<void>();

  readonly user = this.authService.currentUser;

  readonly selectedFile = signal<File | null>(null);
  readonly previewUrl = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly saving = signal(false);

  readonly shownUrl = computed(() => this.previewUrl() ?? this.user()?.avatar_url ?? null);
  readonly hasSavedAvatar = computed(() => !!this.user()?.avatar_url);

  onFileChosen(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    // Reset so choosing the same file again still fires `change`.
    input.value = '';

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      this.error.set('Choose a JPG, PNG or WebP image.');
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      this.error.set('Image must be smaller than 2 MB.');
      return;
    }

    this.revokePreview();
    this.selectedFile.set(file);
    this.previewUrl.set(URL.createObjectURL(file));
    this.error.set(null);
  }

  save(): void {
    const file = this.selectedFile();

    if (!file) return;

    this.run(this.avatarService.upload(file), 'Could not save your profile picture.');
  }

  remove(): void {
    this.run(this.avatarService.remove(), 'Could not remove your profile picture.');
  }

  /** The dialog is the single source of truth for closing; we only reset and notify. */
  onClosed(): void {
    this.revokePreview();
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    this.error.set(null);
    this.closed.emit();
  }

  private run(request: Observable<unknown>, failureMessage: string): void {
    if (this.saving()) return;

    this.saving.set(true);
    this.error.set(null);

    request
      .pipe(
        switchMap(() => this.authService.getCurrentUser()),
        finalize(() => this.saving.set(false)),
      )
      .subscribe({
        next: () => this.onClosed(),
        error: () => this.error.set(`${failureMessage} Please try again.`),
      });
  }

  private revokePreview(): void {
    const url = this.previewUrl();

    if (url) URL.revokeObjectURL(url);
  }
}
