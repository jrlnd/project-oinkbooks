/**
 * The seven default categories every new user starts with.
 * Ported verbatim from v1's pages/register.tsx, where they were written into
 * `users/{uid}/categories` in a Firestore batch at sign-up. In v2 the register
 * endpoint inserts these rows for the new user (see the auth slice).
 */
export const DEFAULT_CATEGORIES: ReadonlyArray<{ icon: string; label: string }> =
  [
    { icon: '🍔', label: 'Food' },
    { icon: '🥦', label: 'Grocery' },
    { icon: '💊', label: 'Health' },
    { icon: '⭐', label: 'Miscellaneous' },
    { icon: '🛒', label: 'Recreation' },
    { icon: '🔁', label: 'Recurring' },
    { icon: '🚗', label: 'Transportation' },
  ];
