import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { InvoiceStatus, Prisma, TransactionType, TransactionStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: number) {
    return this.prisma.payment.findMany({
      where: { invoice: { companyId } },
      include: {
        invoice: {
          include: { client: true },
        },
        user: { select: { id: true, name: true } },
      },
      orderBy: { paymentDate: 'desc' },
    });
  }

  async create(createPaymentDto: CreatePaymentDto, companyId: number, userId?: number) {
    // Transaction SQL atomique
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findFirst({
        where: { id: createPaymentDto.invoiceId, companyId },
        include: { client: true },
      });

      if (!invoice) {
        throw new NotFoundException(`Facture #${createPaymentDto.invoiceId} introuvable`);
      }

      const totalTtc = Number(invoice.totalTtc);
      const currentPaid = Number(invoice.paidAmount);
      const remainingBefore = totalTtc - currentPaid;

      if (createPaymentDto.amount > remainingBefore + 0.01) {
        throw new BadRequestException(
          `Le montant du règlement (${createPaymentDto.amount} €) dépasse le solde restant dû (${remainingBefore.toFixed(2)} €).`,
        );
      }

      const paymentDate = createPaymentDto.paymentDate ? new Date(createPaymentDto.paymentDate) : new Date();

      // 1. Créer le paiement
      const payment = await tx.payment.create({
        data: {
          invoiceId: invoice.id,
          userId,
          amount: new Prisma.Decimal(createPaymentDto.amount),
          paymentMethod: createPaymentDto.paymentMethod,
          reference: createPaymentDto.reference,
          paymentDate,
          notes: createPaymentDto.notes,
        },
      });

      // 2. Mettre à jour la facture
      const newPaidAmount = currentPaid + createPaymentDto.amount;
      const isFullyPaid = Math.abs(newPaidAmount - totalTtc) < 0.01 || newPaidAmount >= totalTtc;
      const newStatus = isFullyPaid ? InvoiceStatus.PAID : InvoiceStatus.PARTIAL;

      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount: new Prisma.Decimal(newPaidAmount),
          status: newStatus,
        },
      });

      // 3. Mettre à jour ou créer la transaction comptable de recette
      const countTx = await tx.transaction.count({ where: { companyId } });
      const year = new Date().getFullYear();
      const refNumber = `REC-${year}-${String(countTx + 1).padStart(3, '0')}`;

      await tx.transaction.create({
        data: {
          companyId,
          clientId: invoice.clientId,
          type: TransactionType.REVENUE,
          refNumber,
          amount: new Prisma.Decimal(createPaymentDto.amount),
          paymentMethod: createPaymentDto.paymentMethod,
          status: TransactionStatus.VALIDATED,
          description: `Règlement facture ${invoice.invoiceNumber} - ${invoice.client.name}`,
          justificatifDgi: 'Facture normalisée DGI',
          date: paymentDate,
        },
      });

      // 4. Mettre à jour le solde du compte de trésorerie approprié
      const cashAccountType = createPaymentDto.paymentMethod === 'CASH' ? 'CASH_REGISTER' : 'BANK';
      const cashAccount = await tx.cashAccount.findFirst({
        where: { companyId, type: cashAccountType },
      });

      if (cashAccount) {
        await tx.cashAccount.update({
          where: { id: cashAccount.id },
          data: {
            balance: {
              increment: new Prisma.Decimal(createPaymentDto.amount),
            },
          },
        });
      }

      // 5. Journal d'audit
      await tx.auditLog.create({
        data: {
          companyId,
          userId,
          action: 'RECORD_PAYMENT',
          entity: 'Payment',
          entityId: payment.id,
          details: `Enregistrement d'un règlement de ${createPaymentDto.amount} € pour la facture ${invoice.invoiceNumber}. Nouveau statut: ${newStatus}`,
        },
      });

      return {
        payment,
        invoiceUpdated: {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          totalTtc,
          newPaidAmount,
          remaining: totalTtc - newPaidAmount,
          status: newStatus,
        },
      };
    });
  }
}
