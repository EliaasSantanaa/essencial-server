import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Formato de e-mail inválido.' })
  @IsNotEmpty({ message: 'O e-mail não pode ser vazio.' })
  email: string;
}