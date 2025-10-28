import {
  AdminCreateUserCommand,
  AdminDisableUserCommand,
  AdminEnableUserCommand,
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ForgotPasswordCommand,
  GetUserCommand,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  SignUpCommand,
  UpdateUserAttributesCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthError, AuthUser } from 'src/models/auth.model';
import { AdminCreateUserDto } from './dto/auth.dto';
import { firestoreDb } from 'src/firebase/firebase-admin.config';
// import { generateRandomPassword } from 'src/utils/password.utils';

function decodeJWT(token: string): { exp?: number; sub?: string } {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return {};
  }
}

function getErrorMessage(error: any): string {
  switch (error.name) {
    case 'NotAuthorizedException':
      return 'Email ou senha incorretos';
    case 'UserNotFoundException':
      return 'Usuário não encontrado';
    case 'InvalidPasswordException':
      return 'Senha deve ter pelo menos 8 caracteres';
    case 'UsernameExistsException':
      return 'Este email já está cadastrado';
    case 'InvalidParameterException':
      return 'Parâmetros inválidos';
    case 'CodeMismatchException':
      return 'Código de verificação incorreto';
    case 'ExpiredCodeException':
      return 'Código de verificação expirado';
    case 'LimitExceededException':
      return 'Muitas tentativas. Tente novamente mais tarde';
    default:
      return error.message || 'Erro desconhecido';
  }
}

@Injectable()
export class AuthService {
  private cognitoClient: CognitoIdentityProviderClient;
  private userPoolClientId: string;
  private userPoolId: string;
  private awsRegion: string;
  private awsAccessKeyId: string;
  private awsSecretAccessKey: string;

  constructor(private configService: ConfigService) {
    this.awsRegion =
      this.configService.get<string>('AWS_REGION') ?? 'default-region';
    this.userPoolClientId =
      this.configService.get<string>('AWS_USER_POOL_CLIENT_ID') ??
      'default-client-id';
    this.userPoolId =
      this.configService.get<string>('AWS_USER_POOL_ID') ??
      'default-user-pool-id';
    this.awsAccessKeyId =
      this.configService.get<string>('AWS_ACCESS_KEY_ID') ??
      'default-access-key-id';
    this.awsSecretAccessKey =
      this.configService.get<string>('AWS_SECRET_ACCESS_KEY') ??
      'default-secret-access-key';

    this.cognitoClient = new CognitoIdentityProviderClient({
      region: this.awsRegion,
      credentials: {
        accessKeyId: this.awsAccessKeyId,
        secretAccessKey: this.awsSecretAccessKey,
      },
    });

    if (!this.awsAccessKeyId || !this.awsSecretAccessKey) {
      throw new InternalServerErrorException(
        'Não foi possível encontrar as credenciais da AWS. Verifique seu arquivo .env.',
      );
    }
    if (!this.userPoolId || !this.userPoolClientId) {
      throw new InternalServerErrorException(
        'Configuração do pool de usuários do Cognito não encontrada. Verifique seu arquivo .env.',
      );
    }
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const command = new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: this.userPoolClientId,
        AuthParameters: { USERNAME: email, PASSWORD: password },
      });
      const response = await this.cognitoClient.send(command);

      if (response.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
        const respondToChallengeCommand = new RespondToAuthChallengeCommand({
          ChallengeName: 'NEW_PASSWORD_REQUIRED',
          ClientId: this.userPoolClientId,
          ChallengeResponses: {
            USERNAME: email,
            NEW_PASSWORD: password,
          },
          Session: response.Session,
        });
        const challengeResponse = await this.cognitoClient.send(
          respondToChallengeCommand,
        );

        if (!challengeResponse.AuthenticationResult) {
          throw new UnauthorizedException(
            'Authentication failed after password challenge',
          );
        }

        const { AccessToken, RefreshToken, IdToken } =
          challengeResponse.AuthenticationResult;

        if (!AccessToken || !RefreshToken || !IdToken) {
          throw new UnauthorizedException('Missing authentication tokens');
        }

        const decoded = decodeJWT(AccessToken);
        const expiresAt = decoded.exp
          ? decoded.exp * 1000
          : Date.now() + 60 * 60 * 1000;

        const userCommand = new GetUserCommand({ AccessToken });
        const userResponse = await this.cognitoClient.send(userCommand);
        const userAttributes = userResponse.UserAttributes || [];

        const email_attr =
          userAttributes.find((attr) => attr.Name === 'email')?.Value || email;
        const sub_attr =
          userAttributes.find((attr) => attr.Name === 'sub')?.Value || '';
        const role_attr =
          userAttributes.find((attr) => attr.Name === 'custom:role')?.Value ||
          'user';
        const name_attr =
          userAttributes.find((attr) => attr.Name === 'name')?.Value || '';

        return {
          email: email_attr,
          sub: sub_attr,
          role: role_attr,
          name: name_attr,
          accessToken: AccessToken,
          refreshToken: RefreshToken,
          idToken: IdToken,
          expiresAt,
        };
      }

      if (!response.AuthenticationResult) {
        throw new UnauthorizedException('Authentication failed');
      }

      const { AccessToken, RefreshToken, IdToken } =
        response.AuthenticationResult;

      if (!AccessToken || !RefreshToken || !IdToken) {
        throw new UnauthorizedException('Missing authentication tokens');
      }

      const decoded = decodeJWT(AccessToken);
      const expiresAt = decoded.exp
        ? decoded.exp * 1000
        : Date.now() + 60 * 60 * 1000;

      const userCommand = new GetUserCommand({ AccessToken });
      const userResponse = await this.cognitoClient.send(userCommand);
      const userAttributes = userResponse.UserAttributes || [];

      const email_attr =
        userAttributes.find((attr) => attr.Name === 'email')?.Value || email;
      const sub_attr =
        userAttributes.find((attr) => attr.Name === 'sub')?.Value || '';
      const role_attr =
        userAttributes.find((attr) => attr.Name === 'custom:role')?.Value ||
        'user';
      const name_attr =
        userAttributes.find((attr) => attr.Name === 'name')?.Value || '';

      return {
        email: email_attr,
        sub: sub_attr,
        role: role_attr,
        name: name_attr,
        accessToken: AccessToken,
        refreshToken: RefreshToken,
        idToken: IdToken,
        expiresAt,
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

  async getNewAccessToken(refreshToken: string): Promise<AuthUser> {
    try {
      const command = new InitiateAuthCommand({
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        ClientId: this.userPoolClientId,
        AuthParameters: {
          REFRESH_TOKEN: refreshToken,
        },
      });
      const response = await this.cognitoClient.send(command);

      if (!response.AuthenticationResult)
        throw new Error('Token refresh failed');
      const { AccessToken, IdToken } = response.AuthenticationResult;
      if (!AccessToken || !IdToken)
        throw new Error('Missing tokens in refresh response');

      const decoded = decodeJWT(AccessToken);
      const expiresAt = decoded.exp
        ? decoded.exp * 1000
        : Date.now() + 60 * 60 * 1000;

      const userCommand = new GetUserCommand({ AccessToken });
      const userResponse = await this.cognitoClient.send(userCommand);
      const userAttributes = userResponse.UserAttributes || [];

      const email_attr =
        userAttributes.find((attr) => attr.Name === 'email')?.Value || '';
      const sub_attr =
        userAttributes.find((attr) => attr.Name === 'sub')?.Value || '';
      const role_attr =
        userAttributes.find((attr) => attr.Name === 'custom:role')?.Value ||
        'user';
      const name_attr =
        userAttributes.find((attr) => attr.Name === 'name')?.Value || '';

      const user: AuthUser = {
        email: email_attr,
        sub: sub_attr,
        role: role_attr,
        name: name_attr,
        accessToken: AccessToken,
        refreshToken:
          response.AuthenticationResult.RefreshToken || refreshToken,
        idToken: IdToken,
        expiresAt,
      };
      return user;
    } catch (error: any) {
      throw {
        code: error.name || 'TokenRefreshError',
        message: getErrorMessage(error),
      } as AuthError;
    }
  }

  async updateUserAttributes(
    accessToken: string,
    attributes: { Name: string; Value: string }[],
  ): Promise<void> {
    try {
      const command = new UpdateUserAttributesCommand({
        AccessToken: accessToken,
        UserAttributes: attributes,
      });
      await this.cognitoClient.send(command);
    } catch (error: any) {
      throw {
        code: error.name || 'UpdateUserAttributesError',
        message: getErrorMessage(error),
      } as AuthError;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      const command = new ForgotPasswordCommand({
        ClientId: this.userPoolClientId,
        Username: email,
      });
      await this.cognitoClient.send(command);
    } catch (error: any) {
      throw {
        code: error.name || 'ForgotPasswordError',
        message: getErrorMessage(error),
      } as AuthError;
    }
  }

  async confirmForgotPassword(
    email: string,
    confirmationCode: string,
    newPassword: string,
  ): Promise<void> {
    try {
      const command = new ConfirmForgotPasswordCommand({
        ClientId: this.userPoolClientId,
        Username: email,
        ConfirmationCode: confirmationCode,
        Password: newPassword,
      });
      await this.cognitoClient.send(command);
    } catch (error: any) {
      throw {
        code: error.name || 'ConfirmForgotPasswordError',
        message: getErrorMessage(error),
      } as AuthError;
    }
  }

  async adminCreateUser(data: AdminCreateUserDto) {
    const { email, name, password, birthday, height, weight, authorizedTerms } =
      data;

    try {
      const command = new AdminCreateUserCommand({
        UserPoolId: this.userPoolId,
        Username: email,
        TemporaryPassword: password,
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'name', Value: name },
          { Name: 'email_verified', Value: 'true' },
        ],
      });
      const res = await this.cognitoClient.send(command);

      if (!res.User) {
        throw new BadRequestException('Criação de usuário falhou');
      }

      const id = res.User.Username || '';

      await firestoreDb.collection('users').doc(id).set({
        name,
        email,
        birthday,
        height,
        weight,
        authorizedTerms,
        createdAt: new Date(),
      });

      const userDoc = await firestoreDb.collection('users').doc(id).get();

      if (!userDoc) {
        throw new InternalServerErrorException('Erro ao recuperar usuário');
      }

      return userDoc.data();
    } catch (error) {
      console.error('Erro ao criar usuário no Cognito:', error);
      const errorMessage = getErrorMessage(error);
      if (
        error.name === 'UsernameExistsException' ||
        error.name === 'InvalidParameterException'
      ) {
        throw new BadRequestException(errorMessage);
      }
      throw new InternalServerErrorException(
        `Erro Cognito: ${errorMessage} (${error.name || 'UnknownError'})`,
      );
    }
  }

  async adminDisableUser(email: string): Promise<void> {
    try {
      const command = new AdminDisableUserCommand({
        UserPoolId: this.userPoolId,
        Username: email,
      });
      await this.cognitoClient.send(command);
    } catch (error: any) {
      if (error.code === 'UserNotFoundException') {
        throw new BadRequestException('Usuário não encontrado.');
      }
      if (error.code === 'InvalidParameterException') {
        throw new BadRequestException(getErrorMessage(error));
      }
      throw new InternalServerErrorException(
        'Erro inesperado ao desabilitar o usuário no Cognito.',
      );
    }
  }

  async adminEnableUser(email: string): Promise<void> {
    try {
      const command = new AdminEnableUserCommand({
        UserPoolId: this.userPoolId,
        Username: email,
      });
      await this.cognitoClient.send(command);
    } catch (error: any) {
      if (error.code === 'UserNotFoundException') {
        throw new BadRequestException('Usuário não encontrado.');
      }
      if (error.code === 'InvalidParameterException') {
        throw new BadRequestException(getErrorMessage(error));
      }
      throw new InternalServerErrorException(
        'Erro inesperado ao habilitar o usuário no Cognito.',
      );
    }
  }
}
