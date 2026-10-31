import { Controller, Post, Get, Param, Body, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AccessService } from './access.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Accréditations & Droits d’accès')
@Controller('access')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AccessController {
  constructor(private accessService: AccessService) {}

  @Post('requests')
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Soumettre une demande d’accréditation pour l’Interface de Gestion' })
  async requestAccreditation(@Request() req: any, @Body('reason') reason?: string) {
    return this.accessService.requestAccreditation(req.user.id, reason);
  }

  @Get('requests')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Lister les demandes d’accréditation en attente ou traitées (Admin)' })
  async getAllRequests(@Request() req: any) {
    return this.accessService.getAllRequests(req.user.companyId);
  }

  @Post('accreditation/:userId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Accréditer un gérant (Action réservée à l’Administrateur)' })
  async grantAccreditation(
    @Request() req: any,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.accessService.grantAccreditation(req.user.id, userId);
  }

  @Post('revoke/:userId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Révoquer l’accréditation d’un gérant (Admin)' })
  async revokeAccreditation(
    @Request() req: any,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.accessService.revokeAccreditation(req.user.id, userId);
  }
}
