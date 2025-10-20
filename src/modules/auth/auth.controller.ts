import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import type { Response } from 'express';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
 } from '@nestjs/swagger';

@ApiTags('Auth')
 @Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  @ApiOperation({summary: 'Login de usuário'})
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login bem-sucedido.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Credenciais inválidas.',
  })
  async signIn(@Body(new ValidationPipe()) signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({summary: 'Registro de novo usuário'})
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Usuário criado com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos (ex: e-mail já existe, validação falhou).',
  })
  async signUp(@Body(new ValidationPipe()) signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  @ApiOperation({summary: 'Redefinição de senha'})
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notificação de e-mail de redefinição de senha enviada (se o e-mail existir).',
  })
  async forgotPassword(
    @Body(new ValidationPipe()) forgotPasswordDto: ForgotPasswordDto,
  ) {
    await this.authService.forgotPassword(forgotPasswordDto);

    return {
      message:
        'Se um usuário com este e-mail estiver registrado, um link para redefinição de senha será enviado.',
    };
  }

  @HttpCode(HttpStatus.OK)
  @Get('verify-email')
  @ApiOperation({summary: 'Verificação de e-mail do usuário'})
  @ApiQuery({
    name: 'oobCode',
    required: true,
    description: 'Código de verificação enviado por e-mail ao usuário.',
  })
  @ApiResponse({
    status: HttpStatus.FOUND,
    description: 'Redireciona para a página de login após verificação bem-sucedida.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Código de verificação ausente ou inválido. Redireciona para falha.',
  })
  async verifyEmail(@Query('oobCode') oobCode: string, @Res() res: Response) {
    if (!oobCode) {
      // Este código agora funciona
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send('Código de verificação ausente.');
    }

    try {
      await this.authService.verifyEmailAndActivateUser(oobCode);
      return res.redirect('https://essencial-dev.vercel.app/sign-in');
    } catch (error) {
      return res.redirect('https://essencial-dev.vercel.app/falha-ativacao');
    }
  }
}
