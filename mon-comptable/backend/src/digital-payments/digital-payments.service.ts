import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountingService } from '../accounting/accounting.service';

@Injectable()
export class DigitalPaymentsService {
  constructor(
    private prisma: PrismaService,
    private accountingService: AccountingService,
  ) {}

  async getConfigurations(companyId: number) {
    return this.prisma.providerConfiguration.findMany({
      where: { companyId },
    });
  }

  async getTransactions(companyId: number, provider?: any, status?: any) {
    const where: any = { companyId };
    if (provider) where.provider = provider;
    if (status) where.status = status;

    return this.prisma.paymentTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        accountingEntry: true,
      },
    });
  }

  async initiatePayment(companyId: number, data: any) {
    // 1. Idempotency check
    if (data.idempotencyKey) {
      const existing = await this.prisma.paymentTransaction.findUnique({
        where: { idempotencyKey: data.idempotencyKey },
      });
      if (existing) {
        return existing;
      }
    }

    // 2. Fetch provider configuration for fees and accounts
    const config = await this.prisma.providerConfiguration.findFirst({
      where: { companyId, provider: data.provider },
    });

    const feeRate = config ? Number(config.commissionRate) : 2.0;
    const amount = Number(data.amount);
    const fee = Number(((amount * feeRate) / 100).toFixed(2));
    const netAmount = Number((amount - fee).toFixed(2));

    const reference = `TXN-${data.provider.substring(0, 3)}-${Date.now().toString().slice(-7)}`;
    const idempotencyKey = data.idempotencyKey || `idemp_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    return this.prisma.paymentTransaction.create({
      data: {
        companyId,
        reference,
        externalTransactionId: data.externalTransactionId,
        provider: data.provider,
        amount,
        fee,
        netAmount,
        currency: data.currency || 'EUR',
        status: 'PENDING',
        customerPhone: data.customerPhone,
        customerCardLast4: data.customerCardLast4,
        idempotencyKey,
      },
    });
  }

  async confirmPaymentAndAccount(companyId: number, transactionId: number, externalId: string) {
    const txn = await this.prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!txn || txn.companyId !== companyId) {
      throw new NotFoundException('Transaction introuvable.');
    }

    if (txn.status === 'SUCCESS') {
      return txn; // Already processed
    }

    // Retrieve default transit account for provider
    const config = await this.prisma.providerConfiguration.findFirst({
      where: { companyId, provider: txn.provider },
    });

    const transitAccountCode = config?.accountingAccountCode || '518100';

    // Find accounts in chart of accounts
    const transitAccount = await this.prisma.chartOfAccount.findFirst({
      where: { companyId, accountNumber: transitAccountCode },
    });
    const commissionAccount = await this.prisma.chartOfAccount.findFirst({
      where: { companyId, accountNumber: '627800' },
    });
    const clientAccount = await this.prisma.chartOfAccount.findFirst({
      where: { companyId, accountNumber: '411100' },
    });
    const bankJournal = await this.prisma.accountingJournal.findFirst({
      where: { companyId, code: 'BQ' },
    });
    const currentPeriod = await this.prisma.accountingPeriod.findFirst({
      where: { fiscalYear: { companyId, isClosed: false }, isClosed: false },
    });

    return this.prisma.$transaction(async (tx) => {
      // 1. Create balanced double-entry in General Accounting if accounts are seeded
      let entryId: number | null = null;
      if (transitAccount && clientAccount && bankJournal && currentPeriod) {
        const year = new Date().getFullYear();
        const count = await tx.accountingEntry.count({ where: { companyId } });
        const entryNumber = `ECR-${year}-${String(count + 1).padStart(5, '0')}`;

        const entry = await tx.accountingEntry.create({
          data: {
            companyId,
            journalId: bankJournal.id,
            periodId: currentPeriod.id,
            entryNumber,
            date: new Date(),
            reference: txn.reference,
            label: `Règlement numérique ${txn.provider} - Réf ${txn.reference}`,
            status: 'VALIDATED',
            totalDebit: txn.amount,
            totalCredit: txn.amount,
            isBalanced: true,
            lines: {
              create: [
                {
                  accountId: transitAccount.id,
                  lineNumber: 1,
                  debit: txn.netAmount,
                  credit: 0,
                  label: `Net perçu sur transit ${txn.provider}`,
                },
                {
                  accountId: commissionAccount ? commissionAccount.id : transitAccount.id,
                  lineNumber: 2,
                  debit: txn.fee,
                  credit: 0,
                  label: `Commission opérateur ${txn.provider}`,
                },
                {
                  accountId: clientAccount.id,
                  lineNumber: 3,
                  debit: 0,
                  credit: txn.amount,
                  label: `Règlement client ${txn.reference}`,
                },
              ],
            },
          },
        });
        entryId = entry.id;
      }

      // 2. Mark payment transaction as SUCCESS
      return tx.paymentTransaction.update({
        where: { id: transactionId },
        data: {
          status: 'SUCCESS',
          externalTransactionId: externalId,
          accountingEntryId: entryId,
        },
      });
    });
  }

  async refundTransaction(companyId: number, transactionId: number, reason: string) {
    const txn = await this.prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
      include: { accountingEntry: true },
    });

    if (!txn || txn.companyId !== companyId) {
      throw new NotFoundException('Transaction introuvable.');
    }

    if (txn.status === 'REFUNDED') {
      throw new BadRequestException('Cette transaction a déjà été remboursée.');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Mark transaction as REFUNDED
      const updatedTxn = await tx.paymentTransaction.update({
        where: { id: transactionId },
        data: { status: 'REFUNDED' },
      });

      // 2. Extourne/contrepassation of accounting entry if exists
      if (txn.accountingEntryId) {
        await this.accountingService.reverseEntry(companyId, 1, txn.accountingEntryId, `Remboursement transaction ${reason}`);
      }

      return updatedTxn;
    });
  }
}
