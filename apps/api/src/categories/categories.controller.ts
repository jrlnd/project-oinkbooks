import { Controller, Get, UseGuards } from '@nestjs/common';
import type { CategoryDetails } from '@oinkbooks/types';

import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthUser } from '../auth/jwt.strategy';
import { CategoriesService } from './categories.service';

@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  list(@CurrentUser() user: AuthUser): Promise<CategoryDetails[]> {
    return this.categories.list(user.id);
  }
}
