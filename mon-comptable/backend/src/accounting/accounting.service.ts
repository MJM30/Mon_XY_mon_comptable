import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountingService {
  constructor(private prisma: PrismaService) {}

  async getChartOfAccounts(companyId: number) {
    return this.prisma.chartOfAccount.findMany({
      where: { companyId },
      orderBy: { accountNumber: 'asc' },
    });
  }

  async createAccount(companyId: number, data: any) {
    const existing = await this.prisma.chartOfAccount.findFirst({
      where: { companyId, accountNumber: data.accountNumber },
    });
    if (existing) {
      throw new BadRequestException(`Le compte n° ${data.accountNumber} existe déjà.`);
    }

    return this.prisma.chartOfAccount.create({
      data: {
        companyId,
        accountNumber: data.accountNumber,
        label: data.label,
        accountClass: Number(data.accountClass),
        nature: data.nature || 'DEBIT',
        parentId: data.parentId ? Number(data.parentId) : null,
        description: data.description,
        isActive: true,
      },
    });
  }

  async getJournals(companyId: number) {
    return this.prisma.accountingJournal.findMany({
      where: { companyId },
      orderBy: { code: 'asc' },
    });
  }

  async getEntries(companyId: number, journalId?: number, periodId?: number) {
    const where: any = { companyId };
    if (journalId) where.journalId = Number(journalId);
    if (periodId) where.periodId = Number(periodId);

    return this.prisma.accountingEntry.findMany({
      where,
      include: {
        journal: true,
        lines: {
          include: {
            account: true,
          },
          orderBy: { lineNumber: 'asc' },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async createEntry(companyId: number, userId: number, data: any) {
    // 1. Strict double-entry balance check: sum(debit) === sum(credit)
    let totalDebit = 0;
    let totalCredit = 0;

    for (const line of data.lines) {
      totalDebit += Number(line.debit || 0);
      totalCredit += Number(line.credit || 0);
    }

    const delta = Math.abs(totalDebit - totalCredit);
    if (delta > 0.005) {
      throw new BadRequestException(
        `L'écriture est déséquilibrée : Total Débit (${totalDebit.toFixed(2)}) ≠ Total Crédit (${totalCredit.toFixed(2)}). Delta: ${delta.toFixed(2)} €`
      );
    }

    // 2. Generate entry number ECR-YYYY-XXXXX
    const year = new Date(data.date).getFullYear();
    const count = await this.prisma.accountingEntry.count({
      where: { companyId },
    });
    const entryNumber = `ECR-${year}-${String(count + 1).padStart(5, '0')}`;

    return this.prisma.$transaction(async (tx) => {
      const entry = await tx.accountingEntry.create({
        data: {
          companyId,
          createdById: userId,
          journalId: Number(data.journalId),
          periodId: Number(data.periodId),
          entryNumber,
          date: new Date(data.date),
          reference: data.reference,
          label: data.label,
          status: 'VALIDATED',
          totalDebit,
          totalCredit,
          isBalanced: true,
          lines: {
            create: data.lines.map((l: any, idx: number) => ({
              accountId: Number(l.accountId),
              lineNumber: idx + 1,
              debit: Number(l.debit || 0),
              credit: Number(l.credit || 0),
              label: l.label || data.label,
              costCenterId: l.costCenterId ? Number(l.costCenterId) : null,
              analyticalSectionId: l.analyticalSectionId ? Number(l.analyticalSectionId) : null,
            })),
          },
        },
        include: {
          lines: true,
        },
      });

      return entry;
    });
  }

  async reverseEntry(companyId: number, userId: number, entryId: number, reason: string) {
    const original = await this.prisma.accountingEntry.findUnique({
      where: { id: entryId },
      include: { lines: true },
    });

    if (!original || original.companyId !== companyId) {
      throw new NotFoundException('Écriture non trouvée.');
    }

    if (original.status === 'CANCELLED') {
      throw new BadRequestException('Cette écriture a déjà été annulée / extournée.');
    }

    const year = new Date().getFullYear();
    const count = await this.prisma.accountingEntry.count({ where: { companyId } });
    const reverseNumber = `ECR-${year}-${String(count + 1).padStart(5, '0')}`;

    return this.prisma.$transaction(async (tx) => {
      // Mark original CANCELLED
      await tx.accountingEntry.update({
        where: { id: entryId },
        data: { status: 'CANCELLED' },
      });

      // Create mirror entry with inverted amounts
      const reversed = await tx.accountingEntry.create({
        data: {
          companyId,
          createdById: userId,
          journalId: original.journalId,
          periodId: original.periodId,
          entryNumber: reverseNumber,
          date: new Date(),
          reference: `EXT-${original.entryNumber}`,
          label: `Extourne/Contrepassation de ${original.entryNumber} (${reason})`,
          status: 'VALIDATED',
          totalDebit: original.totalDebit,
          totalCredit: original.totalCredit,
          isBalanced: true,
          lines: {
            create: original.lines.map((l, idx) => ({
              accountId: l.accountId,
              lineNumber: idx + 1,
              debit: l.credit, // Inverted
              credit: l.debit, // Inverted
              label: `Contrepassation : ${l.label || ''}`,
              costCenterId: l.costCenterId,
              analyticalSectionId: l.analyticalSectionId,
            })),
          },
        },
      });

      return reversed;
    });
  }

  async getGeneralLedger(companyId: number, accountId?: number) {
    const where: any = { entry: { companyId, status: 'VALIDATED' } };
    if (accountId) where.accountId = Number(accountId);

    const lines = await this.prisma.accountingEntryLine.findMany({
      where,
      include: {
        account: true,
        entry: {
          include: { journal: true },
        },
      },
      orderBy: { entry: { date: 'asc' } },
    });

    let runningBalance = 0;
    return lines.map((l) => {
      const debit = Number(l.debit);
      const credit = Number(l.credit);
      runningBalance += debit - credit;

      return {
        id: l.id,
        date: l.entry.date,
        entryNumber: l.entry.entryNumber,
        journalCode: l.entry.journal.code,
        accountNumber: l.account.accountNumber,
        accountLabel: l.account.label,
        label: l.label,
        debit,
        credit,
        cumulativeBalance: runningBalance,
      };
    });
  }

  async getTrialBalance(companyId: number) {
    const accounts = await this.prisma.chartOfAccount.findMany({
      where: { companyId, isActive: true },
      orderBy: { accountNumber: 'asc' },
    });

    const lines = await this.prisma.accountingEntryLine.findMany({
      where: { entry: { companyId, status: 'VALIDATED' } },
    });

    return accounts.map((acc) => {
      const accLines = lines.filter((l) => l.accountId === acc.id);
      const totalDebit = accLines.reduce((sum, l) => sum + Number(l.debit), 0);
      const totalCredit = accLines.reduce((sum, l) => sum + Number(l.credit), 0);
      const net = totalDebit - totalCredit;

      return {
        accountNumber: acc.accountNumber,
        label: acc.label,
        accountClass: acc.accountClass,
        totalDebit,
        totalCredit,
        debitBalance: net > 0 ? net : 0,
        creditBalance: net < 0 ? Math.abs(net) : 0,
      };
    });
  }
}
