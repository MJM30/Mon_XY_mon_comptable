import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceStatus, Prisma } from '@prisma/client';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: number, status?: InvoiceStatus, search?: string) {
    const where: Prisma.InvoiceWhereInput = { companyId };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { client: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const invoices = await this.prisma.invoice.findMany({
      where,
      include: {
        client: true,
        items: true,
        payments: true,
      },
      orderBy: { issueDate: 'desc' },
    });

    // Calcul automatique du statut dynamique (vérifier si 'OVERDUE' si échéance dépassée)
    const now = new Date();
    return invoices.map((inv) => {
      let dynamicStatus = inv.status;
      if (
        inv.status !== InvoiceStatus.PAID &&
        inv.status !== InvoiceStatus.DRAFT &&
        new Date(inv.dueDate) < now
      ) {
        dynamicStatus = InvoiceStatus.OVERDUE;
      }
      return {
        ...inv,
        status: dynamicStatus,
        remainingAmount: Number(inv.totalTtc) - Number(inv.paidAmount),
      };
    });
  }

  async findOne(id: number, companyId: number) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, companyId },
      include: {
        client: true,
        items: { include: { product: true } },
        payments: { include: { user: { select: { id: true, name: true } } } },
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Facture #${id} introuvable`);
    }

    return {
      ...invoice,
      remainingAmount: Number(invoice.totalTtc) - Number(invoice.paidAmount),
    };
  }

  async create(createInvoiceDto: CreateInvoiceDto, companyId: number, userId?: number) {
    if (!createInvoiceDto.items || createInvoiceDto.items.length === 0) {
      throw new BadRequestException('Une facture doit contenir au moins une ligne d’article ou prestation.');
    }

    // Calculs stricts des montants
    let subtotalHt = 0;
    let totalVat = 0;

    const itemsData = createInvoiceDto.items.map((item) => {
      const lineHt = Number(item.quantity) * Number(item.unitPriceHt);
      const vatRate = item.vatRate !== undefined ? Number(item.vatRate) : 20.0;
      const lineVat = (lineHt * vatRate) / 100;
      subtotalHt += lineHt;
      totalVat += lineVat;

      return {
        productId: item.productId,
        description: item.description,
        quantity: item.quantity,
        unitPriceHt: new Prisma.Decimal(item.unitPriceHt),
        vatRate: new Prisma.Decimal(vatRate),
        totalHt: new Prisma.Decimal(lineHt),
      };
    });

    const totalTtc = subtotalHt + totalVat;

    // Génération du numéro séquentiel unique (ex: FAC-2025-093)
    const count = await this.prisma.invoice.count({ where: { companyId } });
    const year = new Date().getFullYear();
    const invoiceNumber = `FAC-${year}-${String(count + 1).padStart(3, '0')}`;

    const issueDate = createInvoiceDto.issueDate ? new Date(createInvoiceDto.issueDate) : new Date();
    const dueDate = createInvoiceDto.dueDate
      ? new Date(createInvoiceDto.dueDate)
      : new Date(issueDate.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 jours par défaut

    const invoice = await this.prisma.invoice.create({
      data: {
        companyId,
        clientId: createInvoiceDto.clientId,
        invoiceNumber,
        issueDate,
        dueDate,
        subtotalHt: new Prisma.Decimal(subtotalHt),
        vatRate: new Prisma.Decimal(20.0),
        vatAmount: new Prisma.Decimal(totalVat),
        totalTtc: new Prisma.Decimal(totalTtc),
        paidAmount: new Prisma.Decimal(0),
        status: InvoiceStatus.SENT,
        paymentTerms: createInvoiceDto.paymentTerms || '30 jours net (Virement bancaire)',
        notes: createInvoiceDto.notes,
        items: {
          create: itemsData,
        },
      },
      include: {
        client: true,
        items: true,
      },
    });

    // Journal d'audit
    await this.prisma.auditLog.create({
      data: {
        companyId,
        userId,
        action: 'CREATE_INVOICE',
        entity: 'Invoice',
        entityId: invoice.id,
        details: `Création de la facture ${invoice.invoiceNumber} pour le client ID ${invoice.clientId} d'un montant de ${totalTtc} € TTC`,
      },
    });

    return invoice;
  }

  async updateStatus(id: number, status: InvoiceStatus, companyId: number, userId?: number) {
    const invoice = await this.prisma.invoice.findFirst({ where: { id, companyId } });
    if (!invoice) {
      throw new NotFoundException(`Facture #${id} introuvable`);
    }

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: { status },
      include: { client: true, items: true },
    });

    await this.prisma.auditLog.create({
      data: {
        companyId,
        userId,
        action: 'UPDATE_INVOICE_STATUS',
        entity: 'Invoice',
        entityId: id,
        details: `Statut de la facture ${invoice.invoiceNumber} changé de ${invoice.status} à ${status}`,
      },
    });

    return updated;
  }
}
