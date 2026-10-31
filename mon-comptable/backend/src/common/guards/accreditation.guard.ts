import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { REQUIRE_ACCREDITATION_KEY } from '../decorators/require-accreditation.decorator';

@Injectable()
export class AccreditationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isAccreditationRequired = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_ACCREDITATION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!isAccreditationRequired) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifié');
    }

    // L'ADMIN a toujours accès à l'Interface de Gestion
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // Un GÉRANT doit obligatoirement avoir le flag isAccredited = true validé par l'Administrateur
    if (user.role === UserRole.MANAGER) {
      if (!user.isAccredited) {
        throw new ForbiddenException(
          "Accès refusé à l'Interface de Gestion : Le dirigeant n'a pas encore reçu l'accréditation validée par l'Administrateur.",
        );
      }
      return true;
    }

    // Tout autre rôle est bloqué pour les fonctions d'administration réservées
    throw new ForbiddenException("Espace réservé à l'administration accréditée.");
  }
}
