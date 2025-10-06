import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'O email precisa válido.' })
  @IsNotEmpty({ message: 'O email é obrigatório' })
  email: string;
}