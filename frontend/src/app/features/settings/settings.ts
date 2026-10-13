import { Component, inject } from '@angular/core';

import { AuthService } from '@core/services/auth.service';
import { scoreBandRanges } from '@shared/utils/score-band';

@Component({
  selector: 'app-settings',
  imports: [],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  private readonly authService = inject(AuthService);

  readonly currentUser = this.authService.currentUser;

  /** Derived from the same thresholds the app scores with, so this list cannot drift. */
  readonly thresholds = scoreBandRanges();
}
