/**
 * Shared domain types for OinkBooks v2.
 * Consumed by both the Angular frontend (apps/web) and the NestJS API (apps/api).
 *
 * These are the v2 evolution of v1's models/PurchaseDetails.ts and
 * models/CategoryDetails.ts, adapted to a relational shape:
 *   - Firestore nested `users/{uid}/purchases` -> flat tables with `userId` FKs
 *   - v1 `purchase` (the title) -> `title`
 *   - v1 `category` (the id)    -> `categoryId`
 *   - dates travel over the wire as ISO strings, hydrated to Date in the client
 */

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

export interface CategoryDetails {
  id: string;
  icon: string;
  label: string;
}

export interface PurchaseDetails {
  id: string;
  title: string;
  description: string;
  amount: number;
  categoryId: string;
  /** ISO-8601 string over the wire; hydrate to Date in the client. */
  date: string;
}

/* ---- Data Transfer Objects (request payloads) ---- */

export interface CreatePurchaseDto {
  title: string;
  description?: string;
  amount: number;
  categoryId: string;
  date: string;
}

export type UpdatePurchaseDto = Partial<CreatePurchaseDto>;

export interface RegisterDto {
  email: string;
  username: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
