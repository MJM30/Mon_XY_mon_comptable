import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StockMovementType, Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: number, search?: string) {
    const products = await this.prisma.product.findMany({
      where: {
        companyId,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { reference: { contains: search, mode: 'insensitive' } },
                { category: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { name: 'asc' },
    });

    return products.map((p) => ({
      ...p,
      isAlert: p.quantity <= p.minThreshold,
      totalValuation: p.quantity * Number(p.purchasePrice),
    }));
  }

  async findOne(id: number, companyId: number) {
    const product = await this.prisma.product.findFirst({
      where: { id, companyId },
      include: {
        stockMovements: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Produit #${id} introuvable`);
    }

    return {
      ...product,
      isAlert: product.quantity <= product.minThreshold,
      totalValuation: product.quantity * Number(product.purchasePrice),
    };
  }

  async getAlerts(companyId: number) {
    const products = await this.prisma.product.findMany({
      where: { companyId },
    });

    return products
      .filter((p) => p.quantity <= p.minThreshold)
      .map((p) => ({
        ...p,
        isRupture: p.quantity === 0,
        deficit: p.minThreshold - p.quantity,
      }));
  }

  async recordMovement(
    companyId: number,
    data: {
      productId: number;
      type: StockMovementType;
      quantity: number;
      reason?: string;
      reference?: string;
    },
    userId?: number,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: { id: data.productId, companyId },
      });

      if (!product) {
        throw new NotFoundException(`Produit #${data.productId} introuvable`);
      }

      if (data.quantity <= 0) {
        throw new BadRequestException('La quantité du mouvement doit être strictement positive.');
      }

      const prevQty = product.quantity;
      let newQty = prevQty;

      if (data.type === StockMovementType.IN) {
        newQty = prevQty + data.quantity;
      } else if (data.type === StockMovementType.OUT) {
        if (prevQty < data.quantity) {
          throw new BadRequestException(
            `Stock insuffisant (${prevQty} en stock, tentative de sortie de ${data.quantity}). Les stocks négatifs sont refusés.`,
          );
        }
        newQty = prevQty - data.quantity;
      } else if (data.type === StockMovementType.ADJUSTMENT) {
        // En cas d'ajustement, on peut spécifier la nouvelle quantité réelle constatée lors de l'inventaire
        newQty = data.quantity;
      }

      const status = newQty === 0 ? 'RUPTURE' : newQty <= product.minThreshold ? 'ALERT' : 'IN_STOCK';

      await tx.product.update({
        where: { id: product.id },
        data: {
          quantity: newQty,
          status,
        },
      });

      const movement = await tx.stockMovement.create({
        data: {
          productId: product.id,
          userId,
          type: data.type,
          quantity: data.quantity,
          previousQuantity: prevQty,
          newQuantity: newQty,
          reason: data.reason || `Mouvement ${data.type}`,
          reference: data.reference,
        },
      });

      await tx.auditLog.create({
        data: {
          companyId,
          userId,
          action: 'STOCK_MOVEMENT',
          entity: 'Product',
          entityId: product.id,
          details: `Mouvement ${data.type} de ${data.quantity} sur l'article ${product.reference} - ${product.name}. Stock: ${prevQty} -> ${newQty}`,
        },
      });

      return movement;
    });
  }

  async getMovements(companyId: number) {
    return this.prisma.stockMovement.findMany({
      where: { product: { companyId } },
      include: {
        product: true,
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
