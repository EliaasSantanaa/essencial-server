import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { SignInDto } from './sign-in.dto';

export class SignUpDto extends SignInDto {
  @IsString({ message: 'name deve ser uma string' })
  @IsNotEmpty({ message: 'name é obrigatório' })
  name: string;

  @IsString({ message: 'birthday deve ser uma string' })
  @IsNotEmpty({ message: 'birthday é obrigatório' })
  birthday: string;

  @IsNumber({}, { message: 'height deve ser um número' })
  @IsNotEmpty({ message: 'height é obrigatório' })
  height: number;

  @IsNumber({}, { message: 'weight deve ser um número' })
  @IsNotEmpty({ message: 'weight é obrigatório' })
  weight: number;

  @IsString({ message: 'role deve ser uma string' })
  @IsNotEmpty({ message: 'role é obrigatório  ' })
  role: string;

  @IsBoolean({ message: 'authorized deve ser um booleano' })
  @IsNotEmpty({ message: 'authorized é obrigatório' })
  authorized: boolean;
}
