import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { combineLatest, map } from 'rxjs';

import { CategoriesService } from '../../core/data/categories.service';
import {
  PurchasesService,
  type HydratedPurchase,
} from '../../core/data/purchases.service';

/**
 * Slice 5 wiring proof — sets a 30-day range on the PurchasesService, joins
 * its stream with the categories stream, and renders a simple list with
 * resolved icons. Slice 7 replaces this with the MatTable + edit/delete.
 */
@Component({
  selector: 'app-purchases',
  imports: [CommonModule, MatCardModule, CurrencyPipe, DatePipe],
  template: `
    <h1 class="page-title">Monthly Purchases</h1>

    @if (view$ | async; as view) {
      <mat-card appearance="outlined" class="page-card">
        <p class="meta">
          {{ view.purchases.length }} purchase{{ view.purchases.length === 1 ? '' : 's' }} in the
          last 30 days
        </p>

        @if (view.purchases.length === 0) {
          <p>No purchases yet. The add-new dialog lands in slice 9.</p>
        } @else {
          <ul class="rows">
            @for (p of view.purchases; track p.id) {
              <li class="row">
                <span class="icon">{{ view.iconFor(p.categoryId) }}</span>
                <span class="title">{{ p.title }}</span>
                <span class="date">{{ p.date | date: 'MMM d' }}</span>
                <span class="amount">{{ p.amount | currency: 'USD' }}</span>
              </li>
            }
          </ul>
        }
      </mat-card>
    } @else {
      <mat-card appearance="outlined" class="page-card">Loading…</mat-card>
    }
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
      .meta {
        margin: 0 0 0.75rem;
        opacity: 0.7;
      }
      .rows {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .row {
        display: grid;
        grid-template-columns: 2rem 1fr auto auto;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem 0;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      }
      .row:last-child {
        border-bottom: 0;
      }
      .icon {
        font-size: 1.25rem;
      }
      .title {
        font-weight: 500;
      }
      .date {
        opacity: 0.7;
        font-size: 0.9rem;
      }
      .amount {
        font-variant-numeric: tabular-nums;
        font-weight: 600;
      }
    `,
  ],
})
export class Purchases implements OnInit {
  private readonly purchasesSvc = inject(PurchasesService);
  private readonly categoriesSvc = inject(CategoriesService);

  /**
   * Join purchases$ and categories$ into a single view model. combineLatest
   * waits for both, then re-emits whenever either side updates (a new
   * category list or a refreshed purchases list both re-render).
   */
  protected readonly view$ = combineLatest([
    this.purchasesSvc.purchases$,
    this.categoriesSvc.categories$,
  ]).pipe(
    map(([purchases, categories]) => ({
      purchases: purchases as HydratedPurchase[],
      iconFor: (id: string) => this.categoriesSvc.iconFor(categories, id),
    })),
  );

  ngOnInit(): void {
    // 30-day window ending today.
    const to = new Date();
    const from = new Date(to);
    from.setDate(to.getDate() - 30);
    this.purchasesSvc.setRange({ from, to });
  }
}
