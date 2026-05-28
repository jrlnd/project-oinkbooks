import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register/register').then((m) => m.Register),
  },
  {
    // Authenticated shell: NavBar + <router-outlet>. One guard covers every
    // child page — the v2 replacement for v1's per-page <AuthCheck> wrap and
    // Next's getLayout pattern.
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/shell/shell').then((m) => m.Shell),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'purchases',
        loadComponent: () =>
          import('./features/purchases/purchases').then((m) => m.Purchases),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: '' },
];
