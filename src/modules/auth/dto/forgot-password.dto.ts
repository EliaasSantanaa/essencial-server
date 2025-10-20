import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'E-mail do usuário para o qual a redefinição de senha será enviada.',
    example: 'usuario.cadastrado@dominio.com',
  })
  @IsEmail({}, { message: 'O email precisa válido.' })
  @IsNotEmpty({ message: 'O email é obrigatório' })
  email: string;
}