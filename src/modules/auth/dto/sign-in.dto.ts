import { IsString, IsNotEmpty, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {

    @ApiProperty({
        description: 'Endereço de e-mail do usuário para login.',
        example: 'teste@exemplo.com',
    })
    @IsEmail({},{ message: 'email deve ser válido' })
    @IsNotEmpty({ message: 'email é obrigatório' })
    email: string;

    @ApiProperty({
        description: 'Senha do usuário para login.',
        example: 'minhasenhaforte123',
        minLength: 6,
    })
    @IsString({ message: 'password deve ser uma string' })
    @IsNotEmpty({ message: 'password é obrigatório' })
    password: string;
}