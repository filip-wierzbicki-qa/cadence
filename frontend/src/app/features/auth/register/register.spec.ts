import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';

import { MIN_PASSWORD_LENGTH, Register } from './register';

describe('Register', () => {
  let fixture: ComponentFixture<Register>;
  let component: Register;
  let http: HttpTestingController;

  const valid = {
    username: 'Ada',
    email: 'ada@example.com',
    password: 'longenough',
    confirmPassword: 'longenough',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('requires the same minimum password length as resetting a password', () => {
    expect(MIN_PASSWORD_LENGTH).toBe(8);

    component.registerForm.setValue({ ...valid, password: 'short', confirmPassword: 'short' });
    expect(component.registerForm.controls.password.hasError('minlength')).toBe(true);
    expect(component.registerForm.invalid).toBe(true);
  });

  it('reports a mismatch on the confirmation without hiding other errors', () => {
    component.registerForm.setValue({ ...valid, confirmPassword: 'different1' });
    const confirm = component.registerForm.controls.confirmPassword;

    expect(confirm.hasError('passwordMismatch')).toBe(true);

    confirm.setValue('');
    expect(confirm.hasError('required')).toBe(true);
    expect(confirm.hasError('passwordMismatch')).toBe(false);

    confirm.setValue('longenough');
    expect(confirm.errors).toBeNull();
  });

  it('re-checks the match when the password changes after the confirmation', () => {
    component.registerForm.setValue(valid);
    component.registerForm.controls.password.setValue('another-one');

    expect(component.registerForm.controls.confirmPassword.hasError('passwordMismatch')).toBe(true);
  });

  it('shows a message when the account already exists', () => {
    component.registerForm.setValue(valid);
    component.submit();
    http
      .expectOne((req) => req.url.endsWith('/auth/register'))
      .flush('exists', { status: 422, statusText: 'Unprocessable' });
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('.banner--error')?.textContent,
    ).toContain('already exists');
  });

  it('hands the email to the sign-in page after registering', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    component.registerForm.setValue(valid);

    component.submit();
    http.expectOne((req) => req.url.endsWith('/auth/register')).flush({});

    expect(navigate).toHaveBeenCalledWith(['/login'], {
      state: { registered: true, email: 'ada@example.com' },
    });
  });
});
