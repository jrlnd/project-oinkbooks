import { relations } from 'drizzle-orm';
import {
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

/**
 * Relational schema for OinkBooks v2.
 *
 * v1 stored everything in Firestore as nested subcollections:
 *   users/{uid}                  -> { username }
 *   users/{uid}/categories/{id}  -> { icon, label }
 *   users/{uid}/purchases/{id}   -> { purchase, description, category, amount, date }
 *
 * Here those flatten into three tables joined by `user_id` foreign keys.
 */

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 15 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  icon: varchar('icon', { length: 16 }).notNull(),
  label: varchar('label', { length: 60 }).notNull(),
});

export const purchases = pgTable('purchases', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  // v1's `category` (the category id) -> a real FK. Restrict delete so a
  // category in use can't be removed out from under its purchases.
  categoryId: uuid('category_id')
    .notNull()
    .references(() => categories.id, { onDelete: 'restrict' }),
  // v1's `purchase` (the title)
  title: varchar('title', { length: 80 }).notNull(),
  description: text('description').notNull().default(''),
  // numeric is returned as a string by the postgres driver; the service layer
  // converts to/from number at the API boundary.
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  date: timestamp('date', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* ---- relations (enable Drizzle's relational query API) ---- */

export const usersRelations = relations(users, ({ many }) => ({
  categories: many(categories),
  purchases: many(purchases),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, { fields: [categories.userId], references: [users.id] }),
  purchases: many(purchases),
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  user: one(users, { fields: [purchases.userId], references: [users.id] }),
  category: one(categories, {
    fields: [purchases.categoryId],
    references: [categories.id],
  }),
}));

export type UserRow = typeof users.$inferSelect;
export type CategoryRow = typeof categories.$inferSelect;
export type PurchaseRow = typeof purchases.$inferSelect;
