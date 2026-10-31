import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'admin@optima.fr' })
  @IsEmail({}, { message: 'Format email invalide' })
  @IsNotEmpty({ message: 'L’adresse email est obligatoire' })
  email: string;
}
