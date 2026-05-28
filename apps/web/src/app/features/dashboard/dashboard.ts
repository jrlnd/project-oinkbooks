import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../core/auth/auth.service';

// Placeholder protected page — proves the auth guard + session. The real
// dashboard (calendar, table, chart) is built in later slices.
@Component({
  selector: 'app-dashboard',
  imports: [MatButtonModule],
  template: `
    <main style="max-width: 720px; margin: 4rem auto; padding: 0 1rem;">
      <h1>🐷 Hello {{ auth.currentUser()?.username }}</h1>
      <p>You're authenticated. Email: {{ auth.currentUser()?.email }}</p>
      <button mat-flat-button color="primary" (click)="auth.logout()">Log out</button>
    </main>
  `,
})
export class Dashboard {
  protected readonly auth = inject(AuthService);
}
