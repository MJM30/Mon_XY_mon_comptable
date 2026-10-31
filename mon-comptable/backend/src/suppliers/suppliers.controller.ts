import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Gestion des Fournisseurs')
@Controller('suppliers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les fournisseurs avec recherche' })
  async findAll(@Request() req: any, @Query('search') search?: string) {
    return this.suppliersService.findAll(req.user.companyId, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulter la fiche fournisseur et l’historique des achats' })
  async findOne(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.suppliersService.findOne(id, req.user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Ajouter un nouveau fournisseur' })
  async create(@Request() req: any, @Body() data: any) {
    return this.suppliersService.create(data, req.user.companyId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier une fiche fournisseur' })
  async update(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any,
  ) {
    return this.suppliersService.update(id, data, req.user.companyId);
  }
}
