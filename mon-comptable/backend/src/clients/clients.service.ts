import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: number, search?: string) {
    return this.prisma.client.findMany({
      where: {
        companyId,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        invoices: {
          select: { id: true, totalTtc: true, paidAmount: true, status: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number, companyId: number) {
    const client = await this.prisma.client.findFirst({
      where: { id, companyId },
      include: {
        invoices: { include: { items: true, payments: true } },
        transactions: true,
        bookings: true,
      },
    });

    if (!client) {
      throw new NotFoundException(`Client #${id} introuvable`);
    }

    const totalFacture = client.invoices.reduce((sum, inv) => sum + Number(inv.totalTtc), 0);
    const totalRegle = client.invoices.reduce((sum, inv) => sum + Number(inv.paidAmount), 0);
    const soldeDu = totalFacture - totalRegle;

    return {
      ...client,
      totalFacture,
      totalRegle,
      soldeDu,
    };
  }

  async create(data: any, companyId: number) {
    return this.prisma.client.create({
      data: {
        ...data,
        companyId,
      },
    });
  }

  async update(id: number, data: any, companyId: number) {
    return this.prisma.client.update({
      where: { id },
      data,
    });
  }
}
