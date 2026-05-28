import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { PurchaseDetails } from '@oinkbooks/types';

import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthUser } from '../auth/jwt.strategy';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { ListPurchasesQuery } from './dto/list-purchases.query';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { PurchasesService } from './purchases.service';

@UseGuards(JwtAuthGuard)
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchases: PurchasesService) {}

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query() q: ListPurchasesQuery,
  ): Promise<PurchaseDetails[]> {
    return this.purchases.list(user.id, {
      from: q.from ? new Date(q.from) : undefined,
      to: q.to ? new Date(q.to) : undefined,
    });
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreatePurchaseDto,
  ): Promise<PurchaseDetails> {
    return this.purchases.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdatePurchaseDto,
  ): Promise<PurchaseDetails> {
    return this.purchases.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    return this.purchases.remove(user.id, id);
  }
}
