import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import type { CategoryDetails } from '@oinkbooks/types';

import { AuthService } from '../../core/auth/auth.service';
import { CategoriesService } from '../../core/data/categories.service';
import {
  PurchasesService,
  type HydratedPurchase,
} from '../../core/data/purchases.service';
import { Calendar, type DayContent } from '../calendar/calendar';
import { CategoryChart } from '../category-chart/category-chart';
import { PurchasesTable } from '../purchases-table/purchases-table';

@Component({
  selector: 'app-dashboard',
  imports: [Calendar, CategoryChart, PurchasesTable],
  template: `
    <h1 class="page-title">Hello {{ auth.currentUser()?.username }}</h1>

    <h2 class="section-title">Weekly Overview</h2>
    <app-calendar
      [calDate]="calDate()"
      [content]="content()"
      [weeklyView]="true"
      (calDateChange)="calDate.set($event)"
    />

    <div class="grid-2">
      <section>
        <h2 class="section-title">Recent Purchases</h2>
        <app-purchases-table
          [purchases]="purchases()"
          [categories]="categories()"
          [pageSize]="5"
        />
      </section>
      <section>
        <app-category-chart
          [purchases]="purchases()"
          [categories]="categories()"
          title="Total Purchases"
        />
      </section>
    </div>
  `,
  styles: [
    `
      .page-title {
        font-weight: 700;
        margin: 0 0 1.5rem;
      }
      .section-title {
        font-weight: 700;
        font-size: 1.25rem;
        margin: 1rem 0 0.75rem;
      }
      .grid-2 {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;
        @media (min-width: 960px) {
          grid-template-columns: 1fr 1fr;
        }
      }
    `,
  ],
})
export class Dashboard {
  protected readonly auth = inject(AuthService);
  private readonly purchasesSvc = inject(PurchasesService);
  private readonly categoriesSvc = inject(CategoriesService);

  readonly calDate = signal(new Date());

  protected readonly dateFrom = computed(() => {
    const d = this.calDate();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay());
  });

  protected readonly dateTo = computed(() => {
    const f = this.dateFrom();
    return new Date(f.getFullYear(), f.getMonth(), f.getDate() + 6, 23, 59, 59, 999);
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
    const days: DayContent[] = [];
    let running = 0;

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
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
}
