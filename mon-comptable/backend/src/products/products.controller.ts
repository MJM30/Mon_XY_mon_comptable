import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { StockMovementType } from '@prisma/client';

@ApiTags('Stocks, Produits & Mouvements')
@Controller('products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les articles en stock avec valorisation' })
  async findAll(@Request() req: any, @Query('search') search?: string) {
    return this.productsService.findAll(req.user.companyId, search);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Lister les articles sous le seuil minimal de réapprovisionnement' })
  async getAlerts(@Request() req: any) {
    return this.productsService.getAlerts(req.user.companyId);
  }

  @Get('movements')
  @ApiOperation({ summary: 'Historique exhaustif et traçable des mouvements de stock' })
  async getMovements(@Request() req: any) {
    return this.productsService.getMovements(req.user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d’un produit et sa fiche d’inventaire' })
  async findOne(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id, req.user.companyId);
  }

  @Post('movements')
  @ApiOperation({ summary: 'Enregistrer une entrée, sortie ou ajustement de stock' })
  async recordMovement(
    @Request() req: any,
    @Body()
    body: {
      productId: number;
      type: StockMovementType;
      quantity: number;
      reason?: string;
      reference?: string;
    },
  ) {
    return this.productsService.recordMovement(req.user.companyId, body, req.user.id);
  }
}
