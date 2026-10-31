import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AccountingService } from './accounting.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('accounting')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Get('chart-of-accounts')
  @Roles('ADMIN', 'ACCOUNTANT', 'FINANCE', 'CONTROLLER', 'MANAGER')
  async getChartOfAccounts(@Request() req: any) {
    const companyId = req.user.companyId || 1;
    return this.accountingService.getChartOfAccounts(companyId);
  }

  @Post('chart-of-accounts')
  @Roles('ADMIN', 'ACCOUNTANT')
  async createAccount(@Request() req: any, @Body() data: any) {
    const companyId = req.user.companyId || 1;
    return this.accountingService.createAccount(companyId, data);
  }

  @Get('journals')
  @Roles('ADMIN', 'ACCOUNTANT', 'FINANCE', 'CONTROLLER', 'MANAGER')
  async getJournals(@Request() req: any) {
    const companyId = req.user.companyId || 1;
    return this.accountingService.getJournals(companyId);
  }

  @Get('entries')
  @Roles('ADMIN', 'ACCOUNTANT', 'FINANCE', 'CONTROLLER', 'MANAGER')
  async getEntries(
    @Request() req: any,
    @Query('journalId') journalId?: number,
    @Query('periodId') periodId?: number,
  ) {
    const companyId = req.user.companyId || 1;
    return this.accountingService.getEntries(companyId, journalId, periodId);
  }

  @Post('entries')
  @Roles('ADMIN', 'ACCOUNTANT')
  async createEntry(@Request() req: any, @Body() data: any) {
    const companyId = req.user.companyId || 1;
    const userId = req.user.id || 1;
    return this.accountingService.createEntry(companyId, userId, data);
  }

  @Post('entries/:id/reverse')
  @Roles('ADMIN', 'ACCOUNTANT')
  async reverseEntry(
    @Request() req: any,
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    const companyId = req.user.companyId || 1;
    const userId = req.user.id || 1;
    return this.accountingService.reverseEntry(companyId, userId, Number(id), reason);
  }

  @Get('general-ledger')
  @Roles('ADMIN', 'ACCOUNTANT', 'FINANCE', 'CONTROLLER', 'MANAGER')
  async getGeneralLedger(@Request() req: any, @Query('accountId') accountId?: number) {
    const companyId = req.user.companyId || 1;
    return this.accountingService.getGeneralLedger(companyId, accountId);
  }

  @Get('trial-balance')
  @Roles('ADMIN', 'ACCOUNTANT', 'FINANCE', 'CONTROLLER', 'MANAGER')
  async getTrialBalance(@Request() req: any) {
    const companyId = req.user.companyId || 1;
    return this.accountingService.getTrialBalance(companyId);
  }
}
