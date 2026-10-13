import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideFlame, LucideTrophy } from '@lucide/angular';

import { DashboardService } from '@core/api/dashboard.service';
import { AuthService } from '@core/services/auth.service';
import { scoreBand } from '@shared/utils/score-band';
import { streakColor } from './streak-color';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DatePipe, DecimalPipe, LucideFlame, LucideTrophy],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly dashboardService = inject(DashboardService);
  private readonly authService = inject(AuthService);

  readonly currentUser = this.authService.currentUser;
  readonly today = new Date();

  readonly dashboard = rxResource({
    stream: () => this.dashboardService.getDashboard(),
  });

  readonly data = computed(() => (this.dashboard.hasValue() ? this.dashboard.value() : null));

  readonly weekBand = computed(() => scoreBand(this.data()?.week.score ?? null));
  readonly todayBand = computed(() => scoreBand(this.data()?.today.score ?? null));
  readonly currentStreakColor = computed(() => streakColor(this.data()?.streak.current ?? 0));
  readonly longestStreakColor = computed(() => streakColor(this.data()?.streak.longest ?? 0));
}
