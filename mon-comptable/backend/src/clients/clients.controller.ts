import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Gestion des Clients')
@Controller('clients')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les clients avec recherche' })
  async findAll(@Request() req: any, @Query('search') search?: string) {
    return this.clientsService.findAll(req.user.companyId, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulter la fiche client complète avec encours et historique' })
  async findOne(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.clientsService.findOne(id, req.user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau client' })
  async create(@Request() req: any, @Body() data: any) {
    return this.clientsService.create(data, req.user.companyId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier une fiche client' })
  async update(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any,
  ) {
    return this.clientsService.update(id, data, req.user.companyId);
  }
}
