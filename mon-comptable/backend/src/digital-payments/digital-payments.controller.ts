import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, Headers } from '@nestjs/common';
import { DigitalPaymentsService } from './digital-payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('payments-digital')
export class DigitalPaymentsController {
  constructor(private readonly paymentsService: DigitalPaymentsService) {}

  @Get('configs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ACCOUNTANT', 'FINANCE', 'CONTROLLER')
  async getConfigurations(@Request() req: any) {
    const companyId = req.user.companyId || 1;
    return this.paymentsService.getConfigurations(companyId);
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ACCOUNTANT', 'FINANCE', 'CONTROLLER', 'SELLER')
  async getTransactions(
    @Request() req: any,
    @Query('provider') provider?: any,
    @Query('status') status?: any,
  ) {
    const companyId = req.user.companyId || 1;
    return this.paymentsService.getTransactions(companyId, provider, status);
  }

  @Post('initiate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ACCOUNTANT', 'FINANCE', 'SELLER', 'CASHIER')
  async initiatePayment(@Request() req: any, @Body() data: any) {
    const companyId = req.user.companyId || 1;
    return this.paymentsService.initiatePayment(companyId, data);
  }

  @Post('transactions/:id/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ACCOUNTANT', 'FINANCE')
  async confirmPayment(
    @Request() req: any,
    @Param('id') id: string,
    @Body('externalId') externalId: string,
  ) {
    const companyId = req.user.companyId || 1;
    return this.paymentsService.confirmPaymentAndAccount(companyId, Number(id), externalId);
  }

  @Post('transactions/:id/refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ACCOUNTANT', 'FINANCE')
  async refundTransaction(
    @Request() req: any,
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    const companyId = req.user.companyId || 1;
    return this.paymentsService.refundTransaction(companyId, Number(id), reason || 'Annulation');
  }

  // Webhook public endpoint called by M-Pesa, Orange Money, Airtel, IllicoCash, Visa
  @Post('webhook/:provider')
  async handleWebhook(
    @Param('provider') provider: string,
    @Body() payload: any,
    @Headers('x-signature') signature: string,
  ) {
    // In production: HMAC-SHA256 signature verification with provider secret
    const companyId = payload.companyId || 1;
    const transactionId = payload.transactionId;
    const externalId = payload.externalId || `EXT-WH-${Date.now()}`;

    if (transactionId) {
      return this.paymentsService.confirmPaymentAndAccount(companyId, Number(transactionId), externalId);
    }
    return { received: true, status: 'IGNORED_NO_TRANSACTION_ID' };
  }
}
