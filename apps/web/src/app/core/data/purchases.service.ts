import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  Subject,
  combineLatest,
  map,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import type {
  CreatePurchaseDto,
  PurchaseDetails,
  UpdatePurchaseDto,
} from '@oinkbooks/types';

import { environment } from '../../../environments/environment';

export interface DateRange {
  from: Date;
  to: Date;
}

/**
 * The v2 RxJS replacement for v1's per-page Firestore `onSnapshot` listener.
 *
 * Pages set the date range (the dashboard wants a 7-day window, the
 * purchases page wants a calendar month). `purchases$` is a single stream
 * driven by two inputs:
 *
 *     [range$, refresh$]  ─combineLatest─►  switchMap(GET /purchases)
 *
 *   - `switchMap` cancels any in-flight request when the range changes,
 *     so a slow earlier response can't overwrite the newer one (same
 *     reasoning as the username-availability check in register).
 *   - `refresh$` is a manual "refetch" trigger (after add/edit/delete) —
 *     the v2 substitute for Firestore's automatic onSnapshot push.
 *   - `shareReplay({bufferSize:1, refCount:true})` lets the dashboard's
 *     calendar, table, and chart all subscribe and share one HTTP call.
 *
 * Hydrate dates from ISO strings (the wire shape from @oinkbooks/types) to
 * real `Date` objects on the way in so consumers can compare/sort by date.
 */
@Injectable({ providedIn: 'root' })
export class PurchasesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/purchases`;

  private readonly range$ = new BehaviorSubject<DateRange | null>(null);
  private readonly refresh$ = new Subject<void>();

  readonly purchases$: Observable<HydratedPurchase[]> = combineLatest([
    this.range$,
    this.refresh$.pipe(startWith(void 0)),
  ]).pipe(
    switchMap(([range]) => {
      if (!range) return [] as never; // wait until a page sets a range
      const params = {
        from: range.from.toISOString(),
        to: range.to.toISOString(),
      };
      return this.http.get<PurchaseDetails[]>(this.base, { params });
    }),
    map((rows) => rows.map(hydrate)),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  /** Set the date window the stream queries against. */
  setRange(range: DateRange): void {
    this.range$.next(range);
  }

  /** Force a refetch (used after mutations on shared subjects). */
  refresh(): void {
    this.refresh$.next();
  }

  create(dto: CreatePurchaseDto): Observable<PurchaseDetails> {
    return this.http
      .post<PurchaseDetails>(this.base, dto)
      .pipe(tap(() => this.refresh()));
  }

  update(id: string, dto: UpdatePurchaseDto): Observable<PurchaseDetails> {
    return this.http
      .patch<PurchaseDetails>(`${this.base}/${id}`, dto)
      .pipe(tap(() => this.refresh()));
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.base}/${id}`)
      .pipe(tap(() => this.refresh()));
  }
}

/** Same fields as the wire type, but with `date` as a real Date for filtering/sorting. */
export interface HydratedPurchase
  extends Omit<PurchaseDetails, 'date'> {
  date: Date;
}

function hydrate(p: PurchaseDetails): HydratedPurchase {
  return { ...p, date: new Date(p.date) };
}
