import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AnalyticalService } from './analytical.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('analytical')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticalController {
  constructor(private readonly analyticalService: AnalyticalService) {}

  @Get('cost-centers')
  @Roles('ADMIN', 'ACCOUNTANT', 'FINANCE', 'CONTROLLER', 'MANAGER')
  async getCostCenters(@Request() req: any) {
    const companyId = req.user.companyId || 1;
    return this.analyticalService.getCostCenters(companyId);
  }

  @Post('cost-centers')
  @Roles('ADMIN', 'CONTROLLER')
  async createCostCenter(@Request() req: any, @Body() data: any) {
    const companyId = req.user.companyId || 1;
    return this.analyticalService.createCostCenter(companyId, data);
  }

  @Get('sections')
  @Roles('ADMIN', 'ACCOUNTANT', 'FINANCE', 'CONTROLLER', 'MANAGER')
  async getSections(@Request() req: any) {
    const companyId = req.user.companyId || 1;
    return this.analyticalService.getSections(companyId);
  }

  @Get('rules')
  @Roles('ADMIN', 'CONTROLLER', 'ACCOUNTANT')
  async getAllocationRules(@Request() req: any) {
    const companyId = req.user.companyId || 1;
    return this.analyticalService.getAllocationRules(companyId);
  }

  @Get('budgets')
  @Roles('ADMIN', 'CONTROLLER', 'FINANCE', 'MANAGER')
  async getBudgets(@Request() req: any) {
    const companyId = req.user.companyId || 1;
    return this.analyticalService.getBudgets(companyId);
  }

  @Post('budgets/:id/lines')
  @Roles('ADMIN', 'CONTROLLER')
  async createBudgetLine(@Request() req: any, @Param('id') id: string, @Body() data: any) {
    const companyId = req.user.companyId || 1;
    return this.analyticalService.createBudgetLine(companyId, Number(id), data);
  }
}
