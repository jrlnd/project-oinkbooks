// Zoneless TestBed initialization for Vitest. No zone.js import — the app uses
// provideZonelessChangeDetection() at runtime; tests should match.
import { getTestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';

getTestBed().initTestEnvironment(
  BrowserTestingModule,
  platformBrowserTesting(),
);
