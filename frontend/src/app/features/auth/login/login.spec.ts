import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';

import { Login } from './login';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let component: Login;
  let http: HttpTestingController;

  const el = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    history.replaceState({}, '');

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function attempt(status: number): void {
    component.loginForm.setValue({ email: 'ada@example.com', password: 'secret' });
    component.login();
    fixture.detectChanges();

    http
      .expectOne((req) => req.url.endsWith('/auth/login'))
      .flush('nope', { status, statusText: 'Error' });
    fixture.detectChanges();
  }

  it('gives every field an autofill hint and keeps a natural tab order', () => {
    const inputs = el().querySelectorAll('input');

    expect(inputs[0].getAttribute('autocomplete')).toBe('username');
    expect(inputs[1].getAttribute('autocomplete')).toBe('current-password');
    expect(el().querySelectorAll('[tabindex]:not([tabindex="0"])').length).toBe(0);
  });

  it('keeps the primary button disabled until the form is valid', () => {
    const button = el().querySelector<HTMLButtonElement>('app-button button')!;
    expect(button.disabled).toBe(true);

    component.loginForm.setValue({ email: 'ada@example.com', password: 'secret' });
    fixture.detectChanges();
    expect(button.disabled).toBe(false);
  });

  it.each([
    [401, 'Incorrect email or password.'],
    [0, "Can't reach Cadence"],
    [500, 'Something went wrong'],
  ])('says what went wrong for a %d', (status, text) => {
    attempt(status);

    const banner = el().querySelector('.banner--error');
    expect(banner?.getAttribute('role')).toBe('alert');
    expect(banner?.textContent).toContain(text);
    expect(component.isSubmitting()).toBe(false);
  });

  it('welcomes a new account and prefills its email', async () => {
    history.replaceState({ registered: true, email: 'new@example.com' }, '');

    fixture = TestBed.createComponent(Login);
    fixture.detectChanges();

    expect(el().querySelector('.banner--success')?.textContent).toContain('Account created');
    expect(fixture.componentInstance.loginForm.controls.email.value).toBe('new@example.com');
  });

  it('goes to the dashboard after signing in', () => {
    vi.stubGlobal('localStorage', { setItem: vi.fn(), getItem: vi.fn(), removeItem: vi.fn() });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    component.loginForm.setValue({ email: 'ada@example.com', password: 'secret' });

    component.login();
    http
      .expectOne((req) => req.url.endsWith('/auth/login'))
      .flush({ access_token: 'a', refresh_token: 'r' });

    expect(navigate).toHaveBeenCalledWith(['/dashboard']);

    vi.unstubAllGlobals();
  });
});
