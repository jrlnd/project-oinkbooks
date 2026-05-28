import {
  AfterViewInit,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import {
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import type { CategoryDetails } from '@oinkbooks/types';

import { CategoriesService } from '../../core/data/categories.service';
import {
  PurchasesService,
  type HydratedPurchase,
} from '../../core/data/purchases.service';
import { DeleteConfirmDialog } from './delete-confirm.dialog';

/**
 * Purchases table — v2 port of v1's components/TransactionsTable.tsx.
 * MUI DataGrid → Angular Material MatTable + MatSort + MatPaginator.
 *
 * Columns mirror v1: Date, Purchase, Category, Description, Amount, and an
 * Actions column (Edit + Delete) when `enableEdit` is true. Delete is wired
 * here via PurchasesService + a confirm dialog. Edit is emitted upward via
 * `editRequested` — the parent owns the edit dialog (slice 9).
 */
@Component({
  selector: 'app-purchases-table',
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule,
  ],
  templateUrl: './purchases-table.html',
  styleUrl: './purchases-table.scss',
})
export class PurchasesTable implements AfterViewInit {
  /* ── inputs ── */
  readonly purchases = input.required<HydratedPurchase[]>();
  readonly categories = input.required<CategoryDetails[]>();
  readonly enableEdit = input(false);
  readonly pageSize = input(5);

  /* ── outputs (intent up to parent) ── */
  readonly editRequested = output<HydratedPurchase>();

  /* ── view children ── */
  private readonly sort = viewChild<MatSort>(MatSort);
  private readonly paginator = viewChild<MatPaginator>(MatPaginator);

  /* ── services ── */
  private readonly categoriesSvc = inject(CategoriesService);
  private readonly purchasesSvc = inject(PurchasesService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  /* ── derived ── */
  protected readonly displayedColumns = computed(() => {
    const base = ['date', 'title', 'category', 'description', 'amount'];
    return this.enableEdit() ? [...base, 'actions'] : base;
  });

  /**
   * MatTableDataSource is mutable; we don't replace it (that would lose the
   * MatSort/MatPaginator wiring). Instead we assign .data when inputs change.
   */
  protected readonly dataSource = new MatTableDataSource<HydratedPurchase>([]);

  constructor() {
    // Custom accessor so the Category column sorts by its displayed label
    // ("🍔 Food") rather than the raw UUID, and date sorts numerically.
    this.dataSource.sortingDataAccessor = (row, prop) => {
      if (prop === 'category') {
        return this.categoriesSvc.labelFor(this.categories(), row.categoryId);
      }
      if (prop === 'date') return row.date.getTime();
      return (row as unknown as Record<string, string | number>)[prop];
    };

    // Keep the data source in sync with the input. effect tracks both signals.
    effect(() => {
      this.dataSource.data = this.purchases();
    });
  }

  ngAfterViewInit(): void {
    // ViewChild signals resolve after view init. Wire sort + paginator once.
    this.dataSource.sort = this.sort() ?? null;
    this.dataSource.paginator = this.paginator() ?? null;
  }

  /** v1 lib/categories.ts parity — used by the template for the Category column. */
  protected categoryLabel(id: string): string {
    return this.categoriesSvc.labelFor(this.categories(), id);
  }

  protected onEdit(row: HydratedPurchase): void {
    this.editRequested.emit(row);
  }

  protected onDelete(row: HydratedPurchase): void {
    this.dialog
      .open<DeleteConfirmDialog, unknown, boolean>(DeleteConfirmDialog, {
        data: { title: row.title, amount: row.amount, date: row.date },
        width: '420px',
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.purchasesSvc.delete(row.id).subscribe({
          next: () =>
            this.snackBar.open(`Deleted "${row.title}"`, 'Dismiss', {
              duration: 3000,
            }),
          error: (err) =>
            this.snackBar.open(
              err?.error?.message ?? 'Delete failed',
              'Dismiss',
              { duration: 4000 },
            ),
        });
      });
  }
}
