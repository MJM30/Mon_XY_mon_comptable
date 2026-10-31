import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TransactionType, TransactionStatus } from '@prisma/client';

@ApiTags('Transactions, Recettes & Dépenses')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les transactions avec filtres croisés' })
  @ApiQuery({ name: 'type', enum: TransactionType, required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'supplierId', required: false })
  @ApiQuery({ name: 'status', enum: TransactionStatus, required: false })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @Request() req: any,
    @Query('type') type?: TransactionType,
    @Query('categoryId') categoryId?: number,
    @Query('supplierId') supplierId?: number,
    @Query('status') status?: TransactionStatus,
    @Query('search') search?: string,
  ) {
    return this.transactionsService.findAll(
      req.user.companyId,
      type,
      categoryId ? Number(categoryId) : undefined,
      supplierId ? Number(supplierId) : undefined,
      status,
      search,
    );
  }

  @Get('expenses/summary')
  @ApiOperation({ summary: 'Synthèse analytique des dépenses et décaissements' })
  async getExpensesSummary(@Request() req: any) {
    return this.transactionsService.getExpensesSummary(req.user.companyId);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Lister les catégories de recettes et dépenses' })
  async getCategories(@Request() req: any) {
    return this.transactionsService.getCategories(req.user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle recette ou dépense' })
  async create(@Request() req: any, @Body() createDto: CreateTransactionDto) {
    return this.transactionsService.create(createDto, req.user.companyId, req.user.id);
  }
}
