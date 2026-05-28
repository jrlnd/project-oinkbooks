import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  of,
  switchMap,
} from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';

// Mirrors the server-side rule in apps/api RegisterDto (ported from v1).
const USERNAME_REGEX = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly showPassword = signal(false);
  protected readonly submitting = signal(false);
  protected readonly usernameStatus = signal('');

  protected readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.pattern(USERNAME_REGEX)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor() {
    // v1 debounced a Firestore read on every keystroke. Here the same idea is a
    // single RxJS pipeline over the control's valueChanges: debounce keystrokes,
    // drop duplicates, and switchMap to the availability endpoint (switchMap
    // cancels the in-flight request when the user keeps typing).
    this.form.controls.username.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((username) => {
          if (!USERNAME_REGEX.test(username)) {
            this.usernameStatus.set(
              username.length > 0 && username.length < 3
                ? 'Username must be at least 3 characters'
                : '',
            );
            return of(null);
          }
          this.usernameStatus.set('Checking…');
          return this.auth
            .checkUsername(username)
            .pipe(catchError(() => of(null)));
        }),
        takeUntilDestroyed(),
      )
      .subscribe((res) => {
        if (!res) return;
        const username = this.form.controls.username.value;
        this.usernameStatus.set(
          res.available
            ? `${username} is available!`
            : 'That username is already taken',
        );
      });
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.submitting.set(false);
        this.snackBar.open(
          err?.error?.message ?? 'Registration failed. Please try again.',
          'Dismiss',
          { duration: 4000 },
        );
      },
    });
  }
}
