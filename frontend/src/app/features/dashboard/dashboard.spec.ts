import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { DashboardResponse } from '@models/dashboardModel';
import { Dashboard } from './dashboard';

const RESPONSE: DashboardResponse = {
  today: { score: 82, scored_components_count: 3, pending_components_count: 1 },
  week: { score: null, days_count: 1 },
  streak: { current: 0, longest: 5 },
};

describe('Dashboard', () => {
  let fixture: ComponentFixture<Dashboard>;
  let http: HttpTestingController;

  const el = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
  });

  it('shows a loading state until the request resolves', () => {
    expect(el().querySelector('[aria-busy="true"]')).toBeTruthy();
    http.expectOne((req) => req.url.endsWith('/dashboard'));
  });

  it('renders scores, handles a null week score and pluralises', async () => {
    http.expectOne((req) => req.url.endsWith('/dashboard')).flush(RESPONSE);
    await fixture.whenStable();
    fixture.detectChanges();

    const rings = el().querySelectorAll('[role="img"]');
    expect(rings[0].getAttribute('aria-label')).toBe('This week: no score');
    expect(rings[1].getAttribute('aria-label')).toContain('Today: 82%');
    expect(el().querySelector('.week-card .stat__label')?.textContent?.trim()).toBe('day counted');
  });

  it('shows an error with retry that reloads the data', async () => {
    http
      .expectOne((req) => req.url.endsWith('/dashboard'))
      .flush('boom', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
    fixture.detectChanges();

    const retry = el().querySelector<HTMLButtonElement>('.dashboard__retry');
    expect(retry).toBeTruthy();

    retry!.click();
    fixture.detectChanges();
    http.expectOne((req) => req.url.endsWith('/dashboard')).flush(RESPONSE);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(el().querySelector('.dashboard__retry')).toBeNull();
    expect(el().querySelector('.today-card')).toBeTruthy();
  });
});
