import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class SignInDto {

    @IsEmail({},{ message: 'O email precisa ser válido' })
    @IsNotEmpty({ message: 'O email é obrigatório' })
    email: string;

    @IsString({ message: 'password deve ser uma string' })
    @IsNotEmpty({ message: 'password é obrigatório' })
    password: string;
}