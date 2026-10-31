import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: number, search?: string) {
    return this.prisma.supplier.findMany({
      where: {
        companyId,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        transactions: {
          select: { id: true, amount: true, status: true, date: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number, companyId: number) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, companyId },
      include: { transactions: true },
    });

    if (!supplier) {
      throw new NotFoundException(`Fournisseur #${id} introuvable`);
    }

    const totalDepenses = supplier.transactions.reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      ...supplier,
      totalDepenses,
    };
  }

  async create(data: any, companyId: number) {
    return this.prisma.supplier.create({
      data: {
        ...data,
        companyId,
      },
    });
  }

  async update(id: number, data: any, companyId: number) {
    return this.prisma.supplier.update({
      where: { id },
      data,
    });
  }
}
