import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Zoneless: signals + async-pipe + manual ChangeDetectorRef drive the UI.
    // Drops the zone.js polyfill at runtime; matches modern Angular best practice.
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    // Required by MatDatepicker; native adapter avoids extra deps. The v2
    // mirror of v1's LocalizationProvider + AdapterDateFns in MUI.
    provideNativeDateAdapter(),
  ],
};
