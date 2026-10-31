import { Controller, Get, Put, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RequireAccreditation } from '../common/decorators/require-accreditation.decorator';
import { AccreditationGuard } from '../common/guards/accreditation.guard';
import { UserRole } from '@prisma/client';

@ApiTags('Utilisateurs, Rôles & Journal d’Audit')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard, AccreditationGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @RequireAccreditation()
  @ApiOperation({ summary: 'Lister les collaborateurs et leurs rôles (Interface de Gestion)' })
  async findAll(@Request() req: any) {
    return this.usersService.findAll(req.user.companyId);
  }

  @Put(':id/role')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Modifier le rôle d’un utilisateur (Admin)' })
  async updateRole(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body('role') role: UserRole,
  ) {
    return this.usersService.updateRole(id, role, req.user.companyId, req.user.id);
  }

  @Get('audit')
  @RequireAccreditation()
  @ApiOperation({ summary: 'Consulter le journal d’audit des actions sensibles' })
  async getAuditLogs(@Request() req: any) {
    return this.usersService.getAuditLogs(req.user.companyId);
  }
}
