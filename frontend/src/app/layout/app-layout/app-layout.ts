import { Component, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  LucideCalendarDays,
  LucideChevronUp,
  LucideHistory,
  LucideLayoutDashboard,
  LucideLogOut,
  LucideSettings,
  LucideTarget,
} from '@lucide/angular';

import { AuthService } from '@core/services/auth.service';
import { Logo } from '@shared/ui/logo/logo';

@Component({
  selector: 'app-app-layout',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    Logo,
    LucideLayoutDashboard,
    LucideCalendarDays,
    LucideHistory,
    LucideTarget,
    LucideSettings,
    LucideLogOut,
    LucideChevronUp,
  ],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.scss',
})
export class AppLayout {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isUserMenuOpen = signal(false);
  readonly currentUser = this.authService.currentUser;

  private readonly userMenu = viewChild<ElementRef<HTMLElement>>('userMenu');
  private readonly userTrigger = viewChild<ElementRef<HTMLButtonElement>>('userTrigger');

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isUserMenuOpen()) {
      return;
    }

    if (!this.userMenu()?.nativeElement.contains(event.target as Node)) {
      this.isUserMenuOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (!this.isUserMenuOpen()) {
      return;
    }

    this.isUserMenuOpen.set(false);
    // Keep keyboard users where they were instead of dropping focus on the page.
    this.userTrigger()?.nativeElement.focus();
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen.update((open) => !open);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
