import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { firebaseAdmin } from '../../../firebase/firebase-admin.config';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.getToken(request);

    if (!token) {
      throw new UnauthorizedException('Token de autenticação não fornecido.');
    }

    try {
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
      
      request.user = decodedToken;

    } catch (error) {
      console.error('Erro ao verificar o token Firebase:', error);
      throw new UnauthorizedException('Token inválido ou expirado.');
    }
    
    // 3. Se chegou até aqui sem erros, o token é válido e o acesso é permitido.
    return true;
  }

  // Método auxiliar para extrair o token do cabeçalho 'Authorization: Bearer <token>'
  private getToken(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}