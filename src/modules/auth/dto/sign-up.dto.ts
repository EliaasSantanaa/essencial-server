import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { SignInDto } from './sign-in.dto';

export class SignUpDto extends SignInDto {
  @IsString({ message: 'nome deve ser uma string' })
  @IsNotEmpty({ message: 'nome não pode ser vazio' })
  name: string;

  @IsString({ message: 'birthday deve ser uma string' })
  @IsNotEmpty({ message: 'birthday não pode ser vazio' })
  birthday: string;

  @IsNumber({}, { message: 'height deve ser um número' })
  @IsNotEmpty({ message: 'height não pode ser vazio' })
  height: number;

  @IsNumber({}, { message: 'weight deve ser um número' })
  @IsNotEmpty({ message: 'weight não pode ser vazio' })
  weight: number;

  @IsString({ message: 'role deve ser uma string' })
  @IsNotEmpty({ message: 'role não pode ser vazio' })
  role: string;

  @IsBoolean({ message: 'authorized deve ser um booleano' })
  @IsNotEmpty({ message: 'authorized não pode ser vazio' })
  authorized: string;
  
}
