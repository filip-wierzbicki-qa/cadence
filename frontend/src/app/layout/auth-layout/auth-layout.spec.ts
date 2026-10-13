import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthLayout } from './auth-layout';

describe('AuthLayout', () => {
  let fixture: ComponentFixture<AuthLayout>;

  const el = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthLayout],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthLayout);
    fixture.detectChanges();
  });

  it('puts the brand and the page in one column so they share a left edge', () => {
    const column = el().querySelector('.content__column');

    expect(column?.querySelector('.content__brand')).toBeTruthy();
    expect(column?.querySelector('router-outlet')).toBeTruthy();
  });

  it('shows a larger logo above the form for when the hero is hidden', () => {
    expect(el().querySelector('.content__brand .logo--lg')).toBeTruthy();
    expect(el().querySelector('.content__brand')?.getAttribute('aria-label')).toBe('Cadence');
  });
});
