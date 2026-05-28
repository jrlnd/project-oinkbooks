import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import {
  LegendPosition,
  NgxChartsModule,
  ScaleType,
  type Color,
} from '@swimlane/ngx-charts';
import type { CategoryDetails } from '@oinkbooks/types';

import { rainbowColors } from '../../core/util/colors';
import type { HydratedPurchase } from '../../core/data/purchases.service';

interface PieDatum {
  name: string;
  value: number;
}

/**
 * Category pie chart — v2 port of v1's components/TransactionsChart.tsx.
 * Recharts → ngx-charts. Rainbow palette is computed per-render based on the
 * number of populated categories (v1 parity).
 *
 * The component is dumb: pass in the same purchases[] + categories[] that
 * feed the table and calendar, and it aggregates spending by category.
 */
@Component({
  selector: 'app-category-chart',
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './category-chart.html',
  styleUrl: './category-chart.scss',
})
export class CategoryChart {
  readonly purchases = input.required<HydratedPurchase[]>();
  readonly categories = input.required<CategoryDetails[]>();
  readonly title = input<string>('Total Purchases by Category');
  readonly legendPosition = input<'right' | 'below'>('below');

  /** Friendly-string -> ngx-charts enum. */
  protected readonly legend = computed<LegendPosition>(() =>
    this.legendPosition() === 'right'
      ? LegendPosition.Right
      : LegendPosition.Below,
  );

  /** Aggregate purchases per category, prefix the label with the icon, drop zeros. */
  protected readonly data = computed<PieDatum[]>(() => {
    const purchases = this.purchases();
    const categories = this.categories();
    return categories
      .map((c) => {
        const total = purchases
          .filter((p) => p.categoryId === c.id)
          .reduce((sum, p) => sum + p.amount, 0);
        return { name: `${c.icon} ${c.label}`, value: total };
      })
      .filter((d) => d.value > 0);
  });

  /** ngx-charts expects a Color object; the rainbow domain is recomputed
   *  whenever the data length changes so the spectrum spans exactly N slices. */
  protected readonly colorScheme = computed<Color>(() => ({
    name: 'oinkbooks',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: rainbowColors(this.data().length),
  }));

  protected readonly isEmpty = computed(() => this.data().length === 0);
}
