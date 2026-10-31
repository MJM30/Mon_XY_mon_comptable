import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccreditationStatus, UserRole } from '@prisma/client';

@Injectable()
export class AccessService {
  constructor(private prisma: PrismaService) {}

  async requestAccreditation(userId: number, reason?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    if (user.role !== UserRole.MANAGER) {
      throw new BadRequestException('Seul un utilisateur avec le rôle Gérant peut demander une accréditation.');
    }

    const request = await this.prisma.managerAccreditation.create({
      data: {
        userId,
        reason: reason || 'Accès requis pour le pilotage opérationnel et les paramètres.',
        status: AccreditationStatus.PENDING,
      },
      include: { user: true },
    });

    await this.prisma.auditLog.create({
      data: {
        companyId: user.companyId,
        userId,
        action: 'REQUEST_ACCREDITATION',
        entity: 'ManagerAccreditation',
        entityId: request.id,
        details: `Demande d'accréditation soumise par le gérant ${user.name} (${user.email})`,
      },
    });

    return request;
  }

  async getAllRequests(companyId: number) {
    return this.prisma.managerAccreditation.findMany({
      where: { user: { companyId } },
      include: {
        user: { select: { id: true, name: true, email: true, role: true, isAccredited: true } },
        grantedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async grantAccreditation(adminId: number, targetUserId: number) {
    const targetUser = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      throw new NotFoundException('Utilisateur cible introuvable');
    }

    // Mise à jour de l'utilisateur
    const updatedUser = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { isAccredited: true },
    });

    // Enregistrement de l'accréditation
    await this.prisma.managerAccreditation.create({
      data: {
        userId: targetUserId,
        status: AccreditationStatus.APPROVED,
        grantedById: adminId,
        grantedAt: new Date(),
        reason: 'Accréditation validée par l’Administrateur.',
      },
    });

    // Journal d'audit
    await this.prisma.auditLog.create({
      data: {
        companyId: targetUser.companyId,
        userId: adminId,
        action: 'GRANT_ACCREDITATION',
        entity: 'User',
        entityId: targetUserId,
        details: `L'administrateur ID ${adminId} a accrédité le gérant ${targetUser.name} (${targetUser.email})`,
      },
    });

    return {
      message: `Accréditation accordée avec succès à ${targetUser.name}`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isAccredited: updatedUser.isAccredited,
      },
    };
  }

  async revokeAccreditation(adminId: number, targetUserId: number) {
    const targetUser = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      throw new NotFoundException('Utilisateur cible introuvable');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { isAccredited: false },
    });

    await this.prisma.managerAccreditation.create({
      data: {
        userId: targetUserId,
        status: AccreditationStatus.REVOKED,
        grantedById: adminId,
        revokedAt: new Date(),
        reason: 'Révocation des droits par l’Administrateur.',
      },
    });

    await this.prisma.auditLog.create({
      data: {
        companyId: targetUser.companyId,
        userId: adminId,
        action: 'REVOKE_ACCREDITATION',
        entity: 'User',
        entityId: targetUserId,
        details: `L'administrateur ID ${adminId} a révoqué l'accréditation du gérant ${targetUser.name}`,
      },
    });

    return {
      message: `Accréditation révoquée pour ${targetUser.name}`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isAccredited: updatedUser.isAccredited,
      },
    };
  }
}
