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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(@Body(new ValidationPipe()) signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body(new ValidationPipe()) signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
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
  async verifyEmail(@Query('oobCode') oobCode: string, @Res() res: Response) {
    if (!oobCode) {
      // Este código agora funciona
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send('Código de verificação ausente.');
    }

    try {
      await this.authService.verifyEmailAndActivateUser(oobCode);
      return res.redirect('https://essencial-dev.vercel.app/signin');
    } catch (error) {
      return res.redirect('https://essencial-dev.vercel.app/falha-ativacao');
    }
  }
}
