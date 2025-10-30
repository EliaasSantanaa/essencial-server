import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Endereço de email do usuário',
    example: 'usuario@exemplo.com',
  })
  @IsEmail({}, { message: 'email deve ser válido' })
  @IsNotEmpty({ message: 'email é obrigatório' })
  email: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'SenhaForte@123',
    minLength: 8,
  })
  @IsString({ message: 'password deve ser uma string' })
  @IsNotEmpty({ message: 'password é obrigatório' })
  @MinLength(8, { message: 'password deve ter no mínimo 8 caracteres' })
  password: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Endereço de email do usuário para recuperação de senha',
    example: 'usuario@exemplo.com',
  })
  @IsEmail({}, { message: 'email deve ser válido' })
  @IsNotEmpty({ message: 'email é obrigatório' })
  email: string;
}

export class ConfirmForgotPasswordDto {
  @ApiProperty({
    description: 'Endereço de email do usuário',
    example: 'usuario@exemplo.com',
  })
  @IsEmail({}, { message: 'email deve ser válido' })
  @IsNotEmpty({ message: 'email é obrigatório' })
  email: string;

  @ApiProperty({
    description: 'Código de confirmação recebido por email',
    example: '123456',
  })
  @IsString({ message: 'confirmationCode deve ser uma string' })
  @IsNotEmpty({ message: 'confirmationCode é obrigatório' })
  confirmationCode: string;

  @ApiProperty({
    description: 'Nova senha do usuário',
    example: 'NovaSenhaForte@123',
    minLength: 8,
  })
  @IsString({ message: 'newPassword deve ser uma string' })
  @IsNotEmpty({ message: 'newPassword é obrigatório' })
  @MinLength(8, { message: 'newPassword deve ter no mínimo 8 caracteres' })
  newPassword: string;
}

export class AdminCreateUserDto {
  @ApiProperty({
    description: 'Endereço de email do usuário',
    example: 'usuario@exemplo.com',
  })
  @IsEmail({}, { message: 'email deve ser válido' })
  @IsNotEmpty({ message: 'email é obrigatório' })
  email: string;

  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João da Silva',
  })
  @IsString({ message: 'name deve ser uma string' })
  @IsNotEmpty({ message: 'name é obrigatório' })
  name: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'SenhaForte@123',
    minLength: 8,
  })
  @IsString({ message: 'password deve ser uma string' })
  @IsNotEmpty({ message: 'password é obrigatório' })
  password: string;

  @ApiProperty({
    description: 'Data de nascimento do usuário (formato preferencial: AAAA-MM-DD)',
    example: '9999-99-99',
  })
  @IsString({ message: 'birthday deve ser uma string' })
  @IsNotEmpty({ message: 'birthday é obrigatório' })
  birthday: string;

  @ApiProperty({
    description: 'Altura do usuário em metros',
    example: 1.75,
  })
  @IsNumber({}, { message: 'height deve ser um número' })
  @IsNotEmpty({ message: 'height é obrigatório' })
  height: number;

  @ApiProperty({
    description: 'Peso do usuário em quilogramas (kg)',
    example: 70.5,
  })
  @IsNumber({}, { message: 'weight deve ser um número' })
  @IsNotEmpty({ message: 'weight é obrigatório' })
  weight: number;

  @ApiProperty({
    description: 'Status de autorização/aceitação dos termos de uso',
    example: true,
  })
  @IsBoolean({ message: 'authorizedTerms deve ser um booleano' })
  @IsNotEmpty({ message: 'authorizedTerms é obrigatório' })
  authorizedTerms: boolean;
}
