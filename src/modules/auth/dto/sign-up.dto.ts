import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { SignInDto } from './sign-in.dto';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto extends SignInDto {

  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva',
  })
  @IsString({ message: 'name deve ser uma string' })
  @IsNotEmpty({ message: 'name é obrigatório' })
  name: string;

  @ApiProperty({
    description: 'Data de nascimento do usuário (formato preferencial AAAA-MM-DD)',
    example: '9999-99-99',
    type: 'string',
  })
  @IsString({ message: 'birthday deve ser uma string' })
  @IsNotEmpty({ message: 'birthday é obrigatório' })
  birthday: string;

  @ApiProperty({
    description: 'Altura do usuário em metros',
    example: 1.75,
    type: 'number',
  })
  @IsNumber({}, { message: 'height deve ser um número' })
  @IsNotEmpty({ message: 'height é obrigatório' })
  height: number;

  @ApiProperty({
    description: 'Peso do usuário em quilogramas (kg)',
    example: 70.5,
    type: 'number',
  })
  @IsNumber({}, { message: 'weight deve ser um número' })
  @IsNotEmpty({ message: 'weight é obrigatório' })
  weight: number;

  @ApiProperty({
    description: 'Status de autorização/aceitação dos termos (true/false)',
    example: true,
    type: 'boolean',
  })
  @IsBoolean({ message: 'authorized deve ser um booleano' })
  @IsNotEmpty({ message: 'authorized é obrigatório' })
  authorized: boolean;
}
