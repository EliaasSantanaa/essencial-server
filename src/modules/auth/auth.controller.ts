import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  Req,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response, Request } from 'express';

import {
  AdminCreateUserDto,
  ConfirmForgotPasswordDto,
  ForgotPasswordDto,
  LoginDto,
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const authUser = await this.authService.signIn(
        loginDto.email,
        loginDto.password,
      );

      response.cookie('auth-refresh-token', authUser.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });

      return {
        user: {
          email: authUser.email,
          sub: authUser.sub,
          role: authUser.role,
          name: authUser.name,
          accessToken: authUser.accessToken,
          expiresAt: authUser.expiresAt,
        },
      };
    } catch (error: any) {
      if (
        error.code === 'NotAuthorizedException' ||
        error.code === 'UserNotConfirmedException'
      ) {
        throw new UnauthorizedException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('auth-refresh-token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });
    return { message: 'Logout successful' };
  }

  @Post('session')
  @HttpCode(HttpStatus.OK)
  async getSession(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['auth-refresh-token'];
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token available');
    }

    try {
      const authUser = await this.authService.getNewAccessToken(refreshToken);

      response.cookie('auth-refresh-token', authUser.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });

      return {
        user: {
          email: authUser.email,
          sub: authUser.sub,
          role: authUser.role,
          name: authUser.name,
          accessToken: authUser.accessToken,
          expiresAt: authUser.expiresAt,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.authService.forgotPassword(forgotPasswordDto.email);
    return { message: 'Verification code sent' };
  }

  @Post('confirm-forgot-password')
  @HttpCode(HttpStatus.OK)
  async confirmForgotPassword(
    @Body() confirmForgotPasswordDto: ConfirmForgotPasswordDto,
  ) {
    await this.authService.confirmForgotPassword(
      confirmForgotPasswordDto.email,
      confirmForgotPasswordDto.confirmationCode,
      confirmForgotPasswordDto.newPassword,
    );
    return { message: 'Password reset successful' };
  }

  @Post('sign-up')
  async adminCreateUser(@Body() data: AdminCreateUserDto) {
    const user = await this.authService.adminCreateUser(data);
    return {
      message: 'Usuário criado com sucesso',
      status: HttpStatus.CREATED,
      user,
    };
  }
}
