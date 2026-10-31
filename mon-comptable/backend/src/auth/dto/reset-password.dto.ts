import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Jeton temporaire reçu par email' })
  @IsString()
  @IsNotEmpty({ message: 'Le jeton de réinitialisation est obligatoire' })
  token: string;

  @ApiProperty({ example: 'NouveauMotDePasse123!' })
  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit comporter au moins 6 caractères' })
  newPassword: string;
}
