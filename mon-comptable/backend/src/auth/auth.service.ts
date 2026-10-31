import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { company: true },
    });

    if (!user) {
      // Message générique pour ne pas révéler l'existence de l'email
      throw new UnauthorizedException('Identifiants incorrects ou compte non autorisé');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Identifiants incorrects ou compte non autorisé');
    }

    const { password, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        companyId: user.companyId,
        userId: user.id,
        action: 'USER_LOGIN',
        entity: 'User',
        entityId: user.id,
        details: `Connexion réussie de l'utilisateur ${user.email} (${user.role})`,
      },
    });

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAccredited: user.isAccredited,
        title: user.title,
        company: user.company,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existing) {
      throw new ConflictException('Cette adresse email est déjà utilisée');
    }

    let company = await this.prisma.company.findFirst();
    if (!company) {
      company = await this.prisma.company.create({
        data: {
          name: registerDto.companyName || 'Optima Solutions PME',
          currency: 'EUR',
        },
      });
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const role = registerDto.role || UserRole.STAFF;
    const isAccredited = role === UserRole.ADMIN;

    const user = await this.prisma.user.create({
      data: {
        name: registerDto.name,
        email: registerDto.email,
        password: hashedPassword,
        role,
        isAccredited,
        title: registerDto.title || (role === UserRole.ADMIN ? 'Dirigeant / Admin' : 'Collaborateur'),
        companyId: company.id,
      },
      include: { company: true },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAccredited: user.isAccredited,
        title: user.title,
        company: user.company,
      },
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    // Ne révèle jamais si l'email existe ou non (protection énumération)
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    if (user) {
      // Génération d'un token cryptographique temporaire (valide 1 heure)
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 3600000); // +1 heure

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetExpires,
        },
      });

      // Journal d'audit
      await this.prisma.auditLog.create({
        data: {
          companyId: user.companyId,
          userId: user.id,
          action: 'FORGOT_PASSWORD_REQUEST',
          entity: 'User',
          entityId: user.id,
          details: `Demande de réinitialisation de mot de passe pour ${user.email}`,
        },
      });

      // Si un service d'envoi SMTP / SES n'est pas encore configuré en production,
      // on trace le token dans les logs du serveur pour permettre le test immédiat
      console.log(`[AUTH-EMAIL-SIMULATOR] Jeton de réinitialisation généré pour ${user.email} : ${resetToken}`);
    }

    return {
      message: 'Si un compte correspond à cette adresse e-mail, un lien de réinitialisation a été envoyé.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: resetPasswordDto.token,
        resetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Le jeton de réinitialisation est invalide ou a expiré.');
    }

    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);

    // Invalider le token après usage unique
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetExpires: null,
      },
    });

    // Journal d'audit
    await this.prisma.auditLog.create({
      data: {
        companyId: user.companyId,
        userId: user.id,
        action: 'RESET_PASSWORD_SUCCESS',
        entity: 'User',
        entityId: user.id,
        details: `Mot de passe réinitialisé avec succès pour ${user.email}`,
      },
    });

    return {
      message: 'Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter.',
    };
  }
}
