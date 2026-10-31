import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { InvoiceStatus } from '@prisma/client';

@ApiTags('Gestion des Factures')
@Controller('invoices')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les factures avec filtres par statut et recherche' })
  @ApiQuery({ name: 'status', enum: InvoiceStatus, required: false })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @Request() req: any,
    @Query('status') status?: InvoiceStatus,
    @Query('search') search?: string,
  ) {
    return this.invoicesService.findAll(req.user.companyId, status, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir le détail complet d’une facture avec ses lignes et règlements' })
  async findOne(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.invoicesService.findOne(id, req.user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle facture avec calculs automatiques HT/TVA/TTC' })
  async create(@Request() req: any, @Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoicesService.create(createInvoiceDto, req.user.companyId, req.user.id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Modifier manuellement le statut d’une facture' })
  async updateStatus(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: InvoiceStatus,
  ) {
    return this.invoicesService.updateStatus(id, status, req.user.companyId, req.user.id);
  }
}
