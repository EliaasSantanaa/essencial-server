import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class SignInDto {

    @IsEmail({},{ message: 'e-mail inválido' })
    @IsNotEmpty({ message: 'e-mail não pode ser vazio' })
    email: string;

    @IsString({ message: 'senha deve ser uma string' })
    @IsNotEmpty({ message: 'senha não pode ser vazia' })
    password: string;

}