import { Body, Controller, HttpCode, HttpStatus, Post, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Sign } from 'crypto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

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
}
