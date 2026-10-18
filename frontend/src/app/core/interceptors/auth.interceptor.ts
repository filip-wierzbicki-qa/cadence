import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isApiRequest = request.url.startsWith(`${environment.apiUrl}/`);
  const isAuthRequest = request.url.startsWith(`${environment.apiUrl}/auth/`);

  if (!isApiRequest || isAuthRequest) {
    return next(request);
  }

  const accessToken = authService.getAccessToken();

  const authorizedRequest = accessToken
    ? request.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    : request;

  return next(authorizedRequest).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }

      const latestToken = authService.getAccessToken();

      if (latestToken && latestToken !== accessToken) {
        return next(
          request.clone({
            setHeaders: {
              Authorization: `Bearer ${latestToken}`,
            },
          }),
        );
      }

      return authService.refreshSession().pipe(
        catchError((refreshError: unknown) => {
          if (refreshError instanceof HttpErrorResponse && refreshError.status === 401) {
            authService.logout();
            void router.navigate(['/login']);
          }

          return throwError(() => refreshError);
        }),
        switchMap(({ access_token }) =>
          next(
            request.clone({
              setHeaders: {
                Authorization: `Bearer ${access_token}`,
              },
            }),
          ),
        ),
      );
    }),
  );
};
