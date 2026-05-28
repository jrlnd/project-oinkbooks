import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

/** Purchases page placeholder. Slices 5–9 wire up the monthly table, chart, and add/edit dialog. */
@Component({
  selector: 'app-purchases',
  imports: [MatCardModule],
  template: `
    <h1 class="page-title">Monthly Purchases</h1>

    <mat-card appearance="outlined" class="page-card">
      <p>The monthly purchases table, chart, and add-new dialog land in slices 5–9.</p>
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
export class Purchases {}
