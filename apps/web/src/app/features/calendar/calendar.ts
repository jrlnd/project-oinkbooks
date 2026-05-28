import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDatepicker,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { map } from 'rxjs';

/** A day with its purchases (already icon-resolved) and running cumulative total. */
export interface DayContent {
  date: Date;
  items: ReadonlyArray<{
    id: string;
    title: string;
    description: string;
    amount: number;
    icon: string;
  }>;
  /** Cumulative total through this day (v1's running spend pattern). */
  total: number;
}

/**
 * Hand-rolled CSS-Grid calendar — the v2 port of v1's components/Calendar.tsx.
 *
 * Two views (`weeklyView`): the dashboard's 7-day strip, or the purchases
 * page's full month with leading/trailing filler. The parent owns `calDate`
 * (signal()) and passes it down via input(); the calendar emits
 * `calDateChange` when the user navigates (output() — strict
 * unidirectional flow, the same pattern you'd see in any Angular app).
 *
 * Responsive behaviour (CDK BreakpointObserver replacing v1's useBreakPoints):
 *   - md+ → 7-column grid; first day aligned via grid-column span
 *   - xs  → single-column "agenda" stack with empty days hidden (the calendar
 *           collapses to "only days with purchases" — v1 parity)
 */
@Component({
  selector: 'app-calendar',
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule,
  ],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class Calendar {
  /* ───── inputs (parent owns the state) ───── */
  readonly calDate = input.required<Date>();
  readonly weeklyView = input(false);
  readonly content = input.required<DayContent[]>();

  /* ───── outputs (events back up) ───── */
  readonly calDateChange = output<Date>();

  private readonly breakpoints = inject(BreakpointObserver);
  protected readonly mdScreen = toSignal(
    this.breakpoints.observe('(min-width: 768px)').pipe(map((s) => s.matches)),
    { initialValue: true },
  );

  /* ───── computed (derive everything from calDate) ───── */
  protected readonly dateFrom = computed(() => {
    const d = this.calDate();
    return this.weeklyView()
      ? new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay())
      : new Date(d.getFullYear(), d.getMonth(), 1);
  });

  protected readonly dateTo = computed(() => {
    const f = this.dateFrom();
    return this.weeklyView()
      ? new Date(f.getFullYear(), f.getMonth(), f.getDate() + 6)
      : new Date(f.getFullYear(), f.getMonth() + 1, 0);
  });

  protected readonly startDay = computed(() => this.dateFrom().getDay());
  protected readonly endDay = computed(() => this.dateTo().getDay());

  protected readonly weekDays = computed(() =>
    this.mdScreen()
      ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      : [],
  );

  protected readonly isEmpty = computed(
    () => this.content().every((d) => d.items.length === 0),
  );

  protected readonly canGoPrev = computed(() => {
    const d = this.calDate();
    // v1 parity: minimum year 2022
    return !(d.getFullYear() <= 2022 && d.getMonth() <= 0 && !this.weeklyView());
  });

  protected readonly canGoNext = computed(() => {
    const d = this.calDate();
    const now = new Date();
    // v1 parity: no future months
    return !(
      d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    );
  });

  /* ───── handlers (compute new date, emit upward) ───── */
  prev(): void {
    const d = this.calDate();
    const next = this.weeklyView()
      ? new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7)
      : new Date(d.getFullYear(), d.getMonth() - 1, 1);
    this.calDateChange.emit(next);
  }

  next(): void {
    const d = this.calDate();
    const next = this.weeklyView()
      ? new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7)
      : new Date(d.getFullYear(), d.getMonth() + 1, 1);
    this.calDateChange.emit(next);
  }

  /** v1 used StaticDatePicker with year+month views; MatDatepicker exposes
   *  the same via startView="multi-year" + (monthSelected). */
  onMonthSelected(date: Date, picker: MatDatepicker<Date>): void {
    this.calDateChange.emit(new Date(date.getFullYear(), date.getMonth(), 1));
    picker.close();
  }

  /** Day's own (non-cumulative) total — DayContent.total carries the running
   *  cumulative figure used in the footer, so the header total is derived here. */
  daySum(items: ReadonlyArray<{ amount: number }>): number {
    return items.reduce((sum, i) => sum + i.amount, 0);
  }
}
