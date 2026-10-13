import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { ForgotPassword } from './forgot-password';

describe('ForgotPassword', () => {
  let fixture: ComponentFixture<ForgotPassword>;
  let component: ForgotPassword;
  let http: HttpTestingController;

  const el = () => fixture.nativeElement as HTMLElement;
  const request = () => http.expectOne((req) => req.url.endsWith('/forgot-password'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgotPassword],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ForgotPassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.forgotPasswordForm.setValue({ email: 'ada@example.com' });
  });

  it('confirms the email was sent and stops further requests', () => {
    component.submit();
    request().flush({ message: 'Check your inbox.' });
    fixture.detectChanges();

    expect(el().querySelector('.banner--success')?.textContent).toContain('Check your inbox.');
    expect(component.forgotPasswordForm.controls.email.disabled).toBe(true);
    expect(el().querySelector<HTMLButtonElement>('app-button button')?.disabled).toBe(true);
  });

  it('explains rate limiting instead of a generic invalid value', () => {
    component.submit();
    request().flush('slow down', { status: 429, statusText: 'Too Many Requests' });
    fixture.detectChanges();

    const banner = el().querySelector('.banner--error');
    expect(banner?.getAttribute('role')).toBe('alert');
    expect(banner?.textContent).toContain('Too many requests');
    expect(component.forgotPasswordForm.controls.email.errors).toBeNull();
  });
});
