import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import type { CategoryDetails } from '@oinkbooks/types';

import {
  PurchasesService,
  type HydratedPurchase,
} from '../../core/data/purchases.service';

export interface PurchaseDialogData {
  categories: readonly CategoryDetails[];
  /** When present, the dialog opens in edit mode and pre-populates the form. */
  purchase?: HydratedPurchase;
}

/**
 * Add / Edit purchase dialog — v2 port of v1's components/AddNewDialog.tsx +
 * the inline edit dialog from TransactionsTable.tsx.
 *
 * react-hook-form Controllers → Angular Reactive Forms; MUI Dialog →
 * MatDialog; @mui/lab DatePicker → MatDatepicker. The same component
 * handles both create and update — branch on `data.purchase`.
 *
 * The dialog owns its own API call so callers (Dashboard / Purchases page)
 * just open it and forget — PurchasesService.create/update fires `refresh$`
 * inside the service, which propagates to every subscriber.
 */
@Component({
  selector: 'app-purchase-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './purchase-dialog.html',
  styleUrl: './purchase-dialog.scss',
})
export class PurchaseDialog {
  private readonly fb = inject(FormBuilder);
  protected readonly dialogRef = inject(MatDialogRef<PurchaseDialog, boolean>);
  private readonly snackBar = inject(MatSnackBar);
  private readonly purchasesSvc = inject(PurchasesService);
  protected readonly data = inject<PurchaseDialogData>(MAT_DIALOG_DATA);

  protected readonly submitting = signal(false);
  protected readonly isEdit = computed(() => !!this.data.purchase);
  protected readonly today = new Date();

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(80)]],
    categoryId: ['', [Validators.required]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    date: [new Date() as Date, [Validators.required]],
    description: [''],
  });

  constructor() {
    const p = this.data.purchase;
    if (p) {
      this.form.setValue({
        title: p.title,
        categoryId: p.categoryId,
        amount: p.amount,
        date: p.date,
        description: p.description ?? '',
      });
    }
  }

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);

    const raw = this.form.getRawValue();
    const dto = {
      title: raw.title.trim(),
      description: raw.description?.trim() ?? '',
      // Round to 2dp (v1 parity — Intl.NumberFormat maximumFractionDigits 2).
      amount: Math.round(raw.amount * 100) / 100,
      categoryId: raw.categoryId,
      date: raw.date.toISOString(),
    };

    const action$ = this.isEdit()
      ? this.purchasesSvc.update(this.data.purchase!.id, dto)
      : this.purchasesSvc.create(dto);

    action$.subscribe({
      next: () => {
        this.snackBar.open(
          this.isEdit() ? 'Purchase updated' : 'Purchase added',
          'Dismiss',
          { duration: 2500 },
        );
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.submitting.set(false);
        this.snackBar.open(
          err?.error?.message ?? 'Save failed. Please try again.',
          'Dismiss',
          { duration: 4000 },
        );
      },
    });
  }

  clear(): void {
    this.form.reset({
      title: '',
      categoryId: '',
      amount: 0,
      date: new Date(),
      description: '',
    });
  }
}
