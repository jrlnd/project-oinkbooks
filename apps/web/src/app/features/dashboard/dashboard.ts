import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

import { AuthService } from '../../core/auth/auth.service';

/**
 * Dashboard page — renders inside the Shell's <router-outlet>. The real
 * weekly calendar + table + chart land in slices 5–8; this is the stub
 * after slice 4 so the shell + routing are wired against a real page.
 */
@Component({
  selector: 'app-dashboard',
  imports: [MatCardModule],
  template: `
    <h1 class="page-title">Hello {{ auth.currentUser()?.username }}</h1>

    <mat-card appearance="outlined" class="page-card">
      <p>
        Welcome to OinkBooks. The dashboard's weekly calendar, recent
        purchases table and category chart land in the next slices.
      </p>
    </mat-card>
  `,
  styles: [
    `
      .page-title {
        font-weight: 700;
        margin: 0 0 1rem;
      }
      .page-card {
        padding: 1rem 1.25rem;
      }
    `,
  ],
})
export class Dashboard {
  protected readonly auth = inject(AuthService);
}
