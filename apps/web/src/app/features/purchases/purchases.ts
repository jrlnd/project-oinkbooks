import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import type { CategoryDetails } from '@oinkbooks/types';

import { CategoriesService } from '../../core/data/categories.service';
import {
  PurchasesService,
  type HydratedPurchase,
} from '../../core/data/purchases.service';
import { Calendar, type DayContent } from '../calendar/calendar';
import { CategoryChart } from '../category-chart/category-chart';
import { PurchasesTable } from '../purchases-table/purchases-table';

/**
 * Monthly Purchases page — v2 port of v1's pages/purchases.tsx.
 *
 * Reuses the same Calendar component as the dashboard (weeklyView=false ⇒
 * full-month grid), and the new PurchasesTable in editable mode so rows
 * can be deleted (edit dialog ships in slice 9).
 */
@Component({
  selector: 'app-purchases',
  imports: [Calendar, CategoryChart, PurchasesTable],
  template: `
    <h1 class="page-title">Monthly Purchases</h1>

    <app-calendar
      [calDate]="calDate()"
      [content]="content()"
      (calDateChange)="calDate.set($event)"
    />

    <app-purchases-table
      [purchases]="purchases()"
      [categories]="categories()"
      [enableEdit]="true"
      [pageSize]="25"
      (editRequested)="onEditRequested($event)"
    />

    <div class="chart-block">
      <app-category-chart
        [purchases]="purchases()"
        [categories]="categories()"
        legendPosition="right"
      />
    </div>
  `,
  styles: [
    `
      .page-title {
        font-weight: 700;
        margin: 0 0 1.5rem;
      }
      .chart-block {
        margin-top: 1.5rem;
      }
    `,
  ],
})
export class Purchases {
  private readonly purchasesSvc = inject(PurchasesService);
  private readonly categoriesSvc = inject(CategoriesService);
  private readonly snackBar = inject(MatSnackBar);

  readonly calDate = signal(new Date());

  protected readonly dateFrom = computed(
    () => new Date(this.calDate().getFullYear(), this.calDate().getMonth(), 1),
  );

  protected readonly dateTo = computed(() => {
    const f = this.dateFrom();
    return new Date(f.getFullYear(), f.getMonth() + 1, 0, 23, 59, 59, 999);
  });

  protected readonly purchases = toSignal(this.purchasesSvc.purchases$, {
    initialValue: [] as HydratedPurchase[],
  });
  protected readonly categories = toSignal(this.categoriesSvc.categories$, {
    initialValue: [] as CategoryDetails[],
  });

  protected readonly content = computed<DayContent[]>(() => {
    const from = this.dateFrom();
    const cats = this.categories();
    const items = this.purchases();
    const numDays = new Date(from.getFullYear(), from.getMonth() + 1, 0).getDate();
    const days: DayContent[] = [];
    let running = 0;

    for (let i = 0; i < numDays; i++) {
      const dayDate = new Date(from.getFullYear(), from.getMonth(), i + 1);
      const dayItems = items
        .filter(
          (p) =>
            p.date.getFullYear() === dayDate.getFullYear() &&
            p.date.getMonth() === dayDate.getMonth() &&
            p.date.getDate() === dayDate.getDate(),
        )
        .map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          amount: p.amount,
          icon: this.categoriesSvc.iconFor(cats, p.categoryId),
        }));
      running += dayItems.reduce((s, x) => s + x.amount, 0);
      days.push({ date: dayDate, items: dayItems, total: running });
    }
    return days;
  });

  constructor() {
    effect(() => {
      this.purchasesSvc.setRange({ from: this.dateFrom(), to: this.dateTo() });
    });
  }

  protected onEditRequested(row: HydratedPurchase): void {
    // The real edit dialog ships in slice 9. For now, just acknowledge.
    this.snackBar.open(
      `Edit dialog for "${row.title}" arrives in slice 9.`,
      'Dismiss',
      { duration: 3000 },
    );
  }
}
