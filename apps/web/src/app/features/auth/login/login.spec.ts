import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  provideZonelessChangeDetection,
  type WritableSignal,
} from '@angular/core';
import type { FormGroup } from '@angular/forms';

import { Login } from './login';

/**
 * Component test for the Login page. We exercise the Reactive Form's
 * validators and the show-password signal without touching the network —
 * provideHttpClient() registers a real client but no request is fired.
 */
interface LoginInternals {
  form: FormGroup;
  showPassword: WritableSignal<boolean>;
  togglePassword(): void;
}

describe('Login component', () => {
  let fixture: ComponentFixture<Login>;
  let cmp: LoginInternals;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideRouter([]),
        provideAnimationsAsync(),
      ],
    });
    fixture = TestBed.createComponent(Login);
    cmp = fixture.componentInstance as unknown as LoginInternals;
    await fixture.whenStable();
  });

  it('form starts empty and invalid', () => {
    expect(cmp.form.value).toEqual({ email: '', password: '' });
    expect(cmp.form.valid).toBe(false);
  });

  it('email validator rejects malformed input', () => {
    cmp.form.controls['email'].setValue('not-an-email');
    cmp.form.controls['password'].setValue('fixture');
    expect(cmp.form.controls['email'].hasError('email')).toBe(true);
    expect(cmp.form.valid).toBe(false);
  });

  it('form becomes valid when both fields look correct', () => {
    cmp.form.controls['email'].setValue('fixture@oinkbooks.test');
    cmp.form.controls['password'].setValue('fixture');
    expect(cmp.form.valid).toBe(true);
  });

  it('togglePassword flips the showPassword signal', () => {
    expect(cmp.showPassword()).toBe(false);
    cmp.togglePassword();
    expect(cmp.showPassword()).toBe(true);
    cmp.togglePassword();
    expect(cmp.showPassword()).toBe(false);
  });
});
