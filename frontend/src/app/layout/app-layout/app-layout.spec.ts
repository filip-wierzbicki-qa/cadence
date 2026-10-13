import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { UserProfile } from '@models/loginModel';
import { AppLayout } from './app-layout';

describe('AppLayout', () => {
  let fixture: ComponentFixture<AppLayout>;
  let component: AppLayout;

  const el = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppLayout],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    TestBed.inject(AuthService).currentUser.set({
      display_name: 'Ada',
      email: 'ada@example.com',
      profileInitial: 'A',
    } as UserProfile);

    fixture = TestBed.createComponent(AppLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('makes the logo a link to the dashboard', () => {
    const home = el().querySelector<HTMLAnchorElement>('.sidebar__home');

    expect(home?.getAttribute('href')).toBe('/dashboard');
    expect(home?.getAttribute('aria-label')).toContain('dashboard');
    expect(home?.querySelector('app-logo')).toBeTruthy();
  });

  it('keeps Settings in the navigation on every screen size', () => {
    const links = Array.from(el().querySelectorAll('.sidebar__nav a')).map((a) =>
      a.getAttribute('href'),
    );

    expect(links).toEqual(['/dashboard', '/today', '/history', '/goals', '/settings']);
    expect(el().querySelector('.sidebar__settings')).toBeNull();
  });

  it('opens the account menu from the card and reflects it for assistive tech', () => {
    const trigger = el().querySelector<HTMLButtonElement>('.user-card')!;

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(el().querySelector('.user-menu__popover')).toBeNull();

    trigger.click();
    fixture.detectChanges();

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(el().querySelector('.user-menu__popover')?.getAttribute('role')).toBe('menu');
  });

  it('closes the menu with Escape and returns focus to the card', () => {
    const trigger = el().querySelector<HTMLButtonElement>('.user-card')!;
    document.body.appendChild(el());

    trigger.click();
    fixture.detectChanges();
    component.onEscape();
    fixture.detectChanges();

    expect(component.isUserMenuOpen()).toBe(false);
    expect(document.activeElement).toBe(trigger);

    el().remove();
  });

  it('closes the menu when clicking elsewhere', () => {
    component.toggleUserMenu();
    fixture.detectChanges();

    document.body.click();
    fixture.detectChanges();

    expect(component.isUserMenuOpen()).toBe(false);
  });
});
