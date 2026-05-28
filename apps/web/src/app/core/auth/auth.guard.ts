import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

/**
 * v2 replacement for v1's <PrivateRoute>. A functional CanActivate guard runs
 * BEFORE a route activates: authenticated users pass, everyone else is
 * redirected to the login page (via a UrlTree, the Angular way to redirect).
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isAuthenticated() ? true : router.createUrlTree(['/login']);
};

/** Inverse guard: keep already-authenticated users off the login/register pages. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isAuthenticated()
    ? router.createUrlTree(['/dashboard'])
    : true;
};
