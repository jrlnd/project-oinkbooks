import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import type { CategoryDetails } from '@oinkbooks/types';

import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/categories`;

  /**
   * Categories are loaded once per session (refCount keeps the cache alive
   * as long as anyone subscribes; a new subscriber after the last drops
   * triggers a fresh fetch — naturally resets across login/logout).
   */
  readonly categories$: Observable<CategoryDetails[]> = this.http
    .get<CategoryDetails[]>(this.base)
    .pipe(shareReplay({ bufferSize: 1, refCount: true }));

  /** v1 lib/categories.ts parity: resolve a category's icon by id. */
  iconFor(categories: readonly CategoryDetails[], id: string): string {
    return categories.find((c) => c.id === id)?.icon ?? '';
  }

  /** v1 parity: "🍔 Food" style label. */
  labelFor(categories: readonly CategoryDetails[], id: string): string {
    const c = categories.find((x) => x.id === id);
    return c ? `${c.icon} ${c.label}` : '';
  }
}
