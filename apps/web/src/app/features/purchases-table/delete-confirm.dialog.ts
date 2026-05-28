import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CurrencyPipe, DatePipe } from '@angular/common';

export interface DeleteConfirmData {
  title: string;
  amount: number;
  date: Date;
}

@Component({
  selector: 'app-delete-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule, CurrencyPipe, DatePipe],
  template: `
    <h2 mat-dialog-title>Delete purchase?</h2>
    <mat-dialog-content>
      <p>
        Delete <strong>{{ data.title }}</strong>
        ({{ data.amount | currency: 'USD' }} on {{ data.date | date: 'MMM d, y' }})?
        This can't be undone.
      </p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="ref.close(false)">Cancel</button>
      <button mat-flat-button color="warn" (click)="ref.close(true)">Delete</button>
    </mat-dialog-actions>
  `,
})
export class DeleteConfirmDialog {
  protected readonly data = inject<DeleteConfirmData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<DeleteConfirmDialog, boolean>);
}
