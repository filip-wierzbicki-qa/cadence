import { Component, inject } from '@angular/core';

import { AuthService } from '@core/services/auth.service';
import { scoreBandRanges } from '@shared/utils/score-band';

import { signal } from '@angular/core';
import { LucidePencil } from '@lucide/angular';

import { Modal } from '@shared/ui/modal/modal';

@Component({
  selector: 'app-settings',
  imports: [Modal, LucidePencil],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  readonly isAvatarModalOpen = signal(false);

  private readonly authService = inject(AuthService);

  readonly currentUser = this.authService.currentUser;

  readonly thresholds = scoreBandRanges();

  openAvatarModal(): void {
    this.isAvatarModalOpen.set(true);
  }

  closeAvatarModal(): void {
    this.isAvatarModalOpen.set(false);
  }
}
