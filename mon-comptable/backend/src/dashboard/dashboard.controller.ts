import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Tableau de Bord & Métriques Financières')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('statistics')
  @ApiOperation({ summary: 'Indicateurs clés financiers (CA, Résultat Net, Trésorerie, BFR)' })
  async getStatistics(@Request() req: any) {
    return this.dashboardService.getStatistics(req.user.companyId);
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Évolution du CA et de la trésorerie sur les derniers mois' })
  async getRevenueEvolution(@Request() req: any) {
    return this.dashboardService.getRevenueEvolution(req.user.companyId);
  }

  @Get('expenses')
  @ApiOperation({ summary: 'Répartition analytique des dépenses par catégorie' })
  async getExpenseBreakdown(@Request() req: any) {
    return this.dashboardService.getExpenseBreakdown(req.user.companyId);
  }

  @Get('recent-transactions')
  @ApiOperation({ summary: 'Dernières écritures comptables du journal' })
  async getRecentTransactions(@Request() req: any, @Query('limit') limit?: number) {
    return this.dashboardService.getRecentTransactions(req.user.companyId, limit ? Number(limit) : 5);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Factures à échéance critique et alertes de rupture stock' })
  async getCriticalAlerts(@Request() req: any) {
    return this.dashboardService.getCriticalAlerts(req.user.companyId);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Métriques de pilotage opérationnel pour l’Interface de Gestion' })
  async getActivityDashboard(@Request() req: any) {
    return this.dashboardService.getActivityDashboard(req.user.companyId);
  }
}
