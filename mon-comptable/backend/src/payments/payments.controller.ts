import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Gestion des Règlements & Paiements')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'Consulter l’historique des paiements encaissés' })
  async findAll(@Request() req: any) {
    return this.paymentsService.findAll(req.user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Enregistrer un paiement (règlement complet ou partiel d’une facture)' })
  async create(@Request() req: any, @Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto, req.user.companyId, req.user.id);
  }
}
