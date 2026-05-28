import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import type { CategoryDetails } from '@oinkbooks/types';

import { CategoriesService } from './categories.service';

describe('CategoriesService — pure helpers', () => {
  let svc: CategoriesService;
  const cats: CategoryDetails[] = [
    { id: 'a', icon: '🍔', label: 'Food' },
    { id: 'b', icon: '🥦', label: 'Grocery' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    svc = TestBed.inject(CategoriesService);
  });

  it('iconFor returns the icon for a known id', () => {
    expect(svc.iconFor(cats, 'a')).toBe('🍔');
    expect(svc.iconFor(cats, 'b')).toBe('🥦');
  });

  it('iconFor returns an empty string for unknown ids', () => {
    expect(svc.iconFor(cats, 'nope')).toBe('');
  });

  it('labelFor returns "icon label" for a known id', () => {
    expect(svc.labelFor(cats, 'a')).toBe('🍔 Food');
  });

  it('labelFor returns an empty string for unknown ids', () => {
    expect(svc.labelFor(cats, 'nope')).toBe('');
  });
});
