import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: number) {
    return this.prisma.user.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isAccredited: true,
        title: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateRole(id: number, role: UserRole, companyId: number, adminId: number) {
    const user = await this.prisma.user.findFirst({ where: { id, companyId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const updated = await this.prisma.user.update({
      where: { id },
      data: { role },
    });

    await this.prisma.auditLog.create({
      data: {
        companyId,
        userId: adminId,
        action: 'UPDATE_USER_ROLE',
        entity: 'User',
        entityId: id,
        details: `Rôle de ${user.name} modifié de ${user.role} vers ${role}`,
      },
    });

    return updated;
  }

  async getAuditLogs(companyId: number) {
    return this.prisma.auditLog.findMany({
      where: { companyId },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
