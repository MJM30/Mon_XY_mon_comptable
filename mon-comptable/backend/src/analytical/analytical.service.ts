import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticalService {
  constructor(private prisma: PrismaService) {}

  async getCostCenters(companyId: number) {
    return this.prisma.costCenter.findMany({
      where: { companyId },
      include: { allocations: true },
      orderBy: { code: 'asc' },
    });
  }

  async createCostCenter(companyId: number, data: any) {
    return this.prisma.costCenter.create({
      data: {
        companyId,
        code: data.code,
        name: data.name,
        description: data.description,
        isActive: true,
      },
    });
  }

  async getSections(companyId: number) {
    return this.prisma.analyticalSection.findMany({
      where: { axis: { companyId } },
      include: { axis: true },
      orderBy: { code: 'asc' },
    });
  }

  async getAllocationRules(companyId: number) {
    return this.prisma.allocationRule.findMany({
      where: { companyId },
      include: { costCenter: true, analyticalSection: true },
    });
  }

  async getBudgets(companyId: number) {
    return this.prisma.budget.findMany({
      where: { companyId },
      include: {
        lines: {
          include: {
            costCenter: true,
            analyticalSection: true,
          },
        },
      },
    });
  }

  async createBudgetLine(companyId: number, budgetId: number, data: any) {
    return this.prisma.budgetLine.create({
      data: {
        budgetId,
        costCenterId: data.costCenterId ? Number(data.costCenterId) : null,
        analyticalSectionId: data.analyticalSectionId ? Number(data.analyticalSectionId) : null,
        accountCode: data.accountCode,
        period: data.period || 'ANNUEL',
        budgetedAmount: Number(data.budgetedAmount),
        actualAmount: 0,
        varianceAmount: Number(data.budgetedAmount),
      },
    });
  }
}
