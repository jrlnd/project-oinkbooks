import {
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import type { CreatePurchaseDto as ICreate } from '@oinkbooks/types';

export class CreatePurchaseDto implements ICreate {
  @IsString()
  @MaxLength(80, { message: 'Title must be 80 characters or fewer' })
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01, { message: 'Amount must be greater than zero' })
  amount!: number;

  @IsUUID()
  categoryId!: string;

  @IsISO8601()
  date!: string;
}
