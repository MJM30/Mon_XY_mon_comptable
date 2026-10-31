import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsArray, ValidateNested, IsOptional, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInvoiceItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  productId?: number;

  @ApiProperty({ example: 'Prestation d’audit organisationnel' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 1200.00 })
  @IsNumber()
  @Min(0)
  unitPriceHt: number;

  @ApiPropertyOptional({ example: 20.00, default: 20.00 })
  @IsOptional()
  @IsNumber()
  vatRate?: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  clientId: number;

  @ApiPropertyOptional({ example: '2025-03-15' })
  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @ApiPropertyOptional({ example: '2025-04-14' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ example: '30 jours net (Virement bancaire)' })
  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @ApiPropertyOptional({ example: 'Accompagnement trimestriel' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [CreateInvoiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];
}
