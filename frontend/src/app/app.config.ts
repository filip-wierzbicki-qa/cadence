import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { ActivatedRouteSnapshot, provideRouter, withViewTransitions } from '@angular/router';
import { AuthLayout } from '@layout/auth-layout/auth-layout';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { authInterceptor } from './core/interceptors/auth.interceptor';

/** True while the router state is showing a signed-out page (sign in, sign up, reset…). */
const usesAuthLayout = (snapshot: ActivatedRouteSnapshot): boolean =>
  snapshot.pathFromRoot.some((route) => route.component === AuthLayout) ||
  snapshot.children.some(usesAuthLayout);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      // Signing in or out is a change of world, not of page: cross-fade it. Moving between
      // pages inside the app stays instant, so nothing else is slowed down.
      withViewTransitions({
        onViewTransitionCreated: ({ transition, from, to }) => {
          if (usesAuthLayout(from) === usesAuthLayout(to)) {
            transition.skipTransition();
          }
        },
      }),
    ),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
