import { HttpInterceptorFn } from '@angular/common/http';

const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const timezoneInterceptor: HttpInterceptorFn = (request, next) =>
  browserTimezone
    ? next(request.clone({ setHeaders: { 'X-Timezone': browserTimezone } }))
    : next(request);
