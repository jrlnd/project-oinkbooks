import { Inject, Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import type { CategoryDetails } from '@oinkbooks/types';

import { DRIZZLE, type DrizzleDB } from '../db/db.module';
import { categories } from '../db/schema';

@Injectable()
export class CategoriesService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async list(userId: string): Promise<CategoryDetails[]> {
    const rows = await this.db
      .select({ id: categories.id, icon: categories.icon, label: categories.label })
      .from(categories)
      .where(eq(categories.userId, userId))
      .orderBy(asc(categories.label));
    return rows;
  }
}
