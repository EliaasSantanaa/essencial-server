import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  private accessTokenVerifier;

  constructor(private configService: ConfigService) {
    const userPoolId = this.configService.get<string>('AWS_USER_POOL_ID');
    const userPoolClientId = this.configService.get<string>('AWS_USER_POOL_CLIENT_ID');

    if (!userPoolId || !userPoolClientId) {
      throw new Error('Variáveis de ambiente do Cognito não estão definidas');
    }

    this.accessTokenVerifier = CognitoJwtVerifier.create({
      userPoolId: userPoolId,
      tokenUse: 'access',
      clientId: userPoolClientId,
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      throw new UnauthorizedException('Não autorizado');
    }

    try {
      const accessPayload = await this.accessTokenVerifier.verify(accessToken);
      (request as any).user = accessPayload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
