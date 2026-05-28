import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, between, desc, eq, gte, lte } from 'drizzle-orm';
import type { PurchaseDetails } from '@oinkbooks/types';

import { DRIZZLE, type DrizzleDB } from '../db/db.module';
import { categories, purchases, type PurchaseRow } from '../db/schema';
import type { CreatePurchaseDto } from './dto/create-purchase.dto';
import type { UpdatePurchaseDto } from './dto/update-purchase.dto';

@Injectable()
export class PurchasesService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async list(
    userId: string,
    range: { from?: Date; to?: Date },
  ): Promise<PurchaseDetails[]> {
    // Date range filter is optional; v1's dashboard uses a 7-day window,
    // purchases page uses a month. Both pass from/to query params.
    const conditions = [eq(purchases.userId, userId)];
    if (range.from && range.to) {
      conditions.push(between(purchases.date, range.from, range.to));
    } else if (range.from) {
      conditions.push(gte(purchases.date, range.from));
    } else if (range.to) {
      conditions.push(lte(purchases.date, range.to));
    }

    const rows = await this.db
      .select()
      .from(purchases)
      .where(and(...conditions))
      .orderBy(desc(purchases.date), asc(purchases.id));

    return rows.map(toPurchase);
  }

  async create(
    userId: string,
    dto: CreatePurchaseDto,
  ): Promise<PurchaseDetails> {
    await this.assertCategoryOwnership(userId, dto.categoryId);

    const [row] = await this.db
      .insert(purchases)
      .values({
        userId,
        categoryId: dto.categoryId,
        title: dto.title,
        description: dto.description ?? '',
        // numeric() takes a string in drizzle/postgres; format with 2dp.
        amount: dto.amount.toFixed(2),
        date: new Date(dto.date),
      })
      .returning();

    return toPurchase(row);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdatePurchaseDto,
  ): Promise<PurchaseDetails> {
    await this.assertOwnership(userId, id);
    if (dto.categoryId) {
      await this.assertCategoryOwnership(userId, dto.categoryId);
    }

    const patch: Partial<typeof purchases.$inferInsert> = {};
    if (dto.title !== undefined) patch.title = dto.title;
    if (dto.description !== undefined) patch.description = dto.description;
    if (dto.amount !== undefined) patch.amount = dto.amount.toFixed(2);
    if (dto.categoryId !== undefined) patch.categoryId = dto.categoryId;
    if (dto.date !== undefined) patch.date = new Date(dto.date);

    const [row] = await this.db
      .update(purchases)
      .set(patch)
      .where(and(eq(purchases.id, id), eq(purchases.userId, userId)))
      .returning();

    return toPurchase(row);
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.assertOwnership(userId, id);
    await this.db
      .delete(purchases)
      .where(and(eq(purchases.id, id), eq(purchases.userId, userId)));
  }

  private async assertOwnership(userId: string, id: string): Promise<void> {
    const [row] = await this.db
      .select({ userId: purchases.userId })
      .from(purchases)
      .where(eq(purchases.id, id));
    if (!row) throw new NotFoundException('Purchase not found');
    if (row.userId !== userId) {
      // Mask as 404 to avoid leaking existence of other users' data.
      throw new NotFoundException('Purchase not found');
    }
  }

  private async assertCategoryOwnership(
    userId: string,
    categoryId: string,
  ): Promise<void> {
    const [row] = await this.db
      .select({ userId: categories.userId })
      .from(categories)
      .where(eq(categories.id, categoryId));
    if (!row || row.userId !== userId) {
      throw new ForbiddenException('Category does not belong to this user');
    }
  }
}

/** Drizzle returns `numeric` as a string and `timestamptz` as a Date; convert
 *  them to the API-boundary shape declared in @oinkbooks/types. */
function toPurchase(row: PurchaseRow): PurchaseDetails {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    amount: Number(row.amount),
    categoryId: row.categoryId,
    date: row.date.toISOString(),
  };
}
