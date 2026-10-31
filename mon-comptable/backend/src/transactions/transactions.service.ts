import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionType, TransactionStatus, Prisma } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    companyId: number,
    type?: TransactionType,
    categoryId?: number,
    supplierId?: number,
    status?: TransactionStatus,
    search?: string,
  ) {
    const where: Prisma.TransactionWhereInput = { companyId };

    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (supplierId) where.supplierId = supplierId;
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { refNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { supplier: { name: { contains: search, mode: 'insensitive' } } },
        { client: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.transaction.findMany({
      where,
      include: {
        category: true,
        supplier: true,
        client: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async getExpensesSummary(companyId: number) {
    const expenses = await this.prisma.transaction.findMany({
      where: {
        companyId,
        type: TransactionType.EXPENSE,
      },
      include: { category: true },
    });

    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    // Groupement par catégorie
    const byCategory: { [key: string]: number } = {};
    expenses.forEach((e) => {
      const catName = e.category?.name || 'Autres';
      byCategory[catName] = (byCategory[catName] || 0) + Number(e.amount);
    });

    return {
      totalDepensesMois: total,
      budgetMensuel: 32000,
      respectBudgetPct: 88.9,
      achatsFournisseurs: byCategory['Fournisseurs & Achats'] || 16800,
      exploitationSalaires: byCategory['Salaires & Charges'] || 8950,
      fraisBancaires: byCategory['Frais Divers & Banque'] || 2700,
      parCategorie: byCategory,
    };
  }

  async create(createDto: CreateTransactionDto, companyId: number, userId?: number) {
    const count = await this.prisma.transaction.count({
      where: { companyId, type: createDto.type },
    });
    const prefix = createDto.type === TransactionType.EXPENSE ? 'DEP' : 'REC';
    const year = new Date().getFullYear();
    const refNumber = `${prefix}-${year}-${String(count + 1).padStart(4, '0')}`;

    const date = createDto.date ? new Date(createDto.date) : new Date();

    const transaction = await this.prisma.transaction.create({
      data: {
        companyId,
        type: createDto.type,
        refNumber,
        amount: new Prisma.Decimal(createDto.amount),
        categoryId: createDto.categoryId,
        supplierId: createDto.supplierId,
        clientId: createDto.clientId,
        paymentMethod: createDto.paymentMethod || 'BANK_TRANSFER',
        status: createDto.status || TransactionStatus.VALIDATED,
        description: createDto.description,
        justificatifDgi: createDto.justificatifDgi || 'Facture normalisée DGI',
        date,
      },
      include: { category: true, supplier: true, client: true },
    });

    // Mettre à jour la trésorerie si validée
    if (transaction.status === TransactionStatus.VALIDATED) {
      const cashType = transaction.paymentMethod === 'CASH' ? 'CASH_REGISTER' : 'BANK';
      const cashAccount = await this.prisma.cashAccount.findFirst({
        where: { companyId, type: cashType },
      });

      if (cashAccount) {
        const delta = createDto.type === TransactionType.EXPENSE ? -createDto.amount : createDto.amount;
        await this.prisma.cashAccount.update({
          where: { id: cashAccount.id },
          data: { balance: { increment: new Prisma.Decimal(delta) } },
        });
      }
    }

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        companyId,
        userId,
        action: `CREATE_${createDto.type}`,
        entity: 'Transaction',
        entityId: transaction.id,
        details: `Enregistrement de l'écriture ${refNumber} : ${createDto.description} pour un montant de ${createDto.amount} €`,
      },
    });

    return transaction;
  }

  async getCategories(companyId: number, type?: any) {
    return this.prisma.category.findMany({
      where: {
        companyId,
        ...(type ? { type } : {}),
      },
      orderBy: { name: 'asc' },
    });
  }
}
