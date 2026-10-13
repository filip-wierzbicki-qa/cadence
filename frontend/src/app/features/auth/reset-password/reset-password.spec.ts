import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { ResetPassword } from './reset-password';

describe('ResetPassword', () => {
  let http: HttpTestingController;

  async function create(hash: string): Promise<ResetPassword> {
    window.location.hash = hash;

    await TestBed.configureTestingModule({
      imports: [ResetPassword],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);

    const fixture = TestBed.createComponent(ResetPassword);
    fixture.detectChanges();

    return fixture.componentInstance;
  }

  afterEach(() => {
    window.location.hash = '';
  });

  it('shows the expired screen when the link carries no token', async () => {
    const component = await create('');

    expect(component.linkExpired()).toBe(true);
  });

  it('shows the form when the link carries a token', async () => {
    const component = await create('#access_token=abc&type=recovery');

    expect(component.linkExpired()).toBe(false);
  });

  it('never writes the recovery token to the console', async () => {
    const log = vi.spyOn(console, 'log');

    await create('#access_token=secret-token');

    expect(log).not.toHaveBeenCalled();
  });

  it('moves to the expired screen when the server rejects the token', async () => {
    const component = await create('#access_token=abc');

    component.resetPasswordForm.setValue({
      password: 'longenough',
      confirmPassword: 'longenough',
    });
    component.submit();
    http
      .expectOne((req) => req.url.endsWith('/reset-password'))
      .flush('expired', { status: 401, statusText: 'Unauthorized' });

    expect(component.linkExpired()).toBe(true);
    expect(component.isSubmitting()).toBe(false);
  });

  it('requires the same password length as sign up', async () => {
    const component = await create('#access_token=abc');

    component.resetPasswordForm.setValue({ password: 'short', confirmPassword: 'short' });

    expect(component.resetPasswordForm.invalid).toBe(true);
  });
});
