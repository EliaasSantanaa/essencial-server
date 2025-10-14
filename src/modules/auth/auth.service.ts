import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { FirebaseConfigService } from '../../firebase/firebase.config';
import {
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { SignUpDto } from './dto/sign-up.dto';
import { UserRecord } from 'firebase-admin/auth';
import {
  firebaseAdmin,
  firestoreDb,
} from '../../firebase/firebase-admin.config';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AuthService {
  private readonly firebaseApiKey: string;
  private readonly emailVerificationUrl: string;

  constructor(
    private readonly firebaseConfigService: FirebaseConfigService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {
    this.firebaseApiKey =
      this.configService.get<string>('FIREBASE_API_KEY') || '';
    this.emailVerificationUrl =
      this.configService.get<string>('EMAIL_VERIFICATION_URL') || '';

  }

  async signIn(signInDto: SignInDto): Promise<{ accessToken: string }> {
    try {
      const auth = getAuth(this.firebaseConfigService.firebaseApp);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        signInDto.email,
        signInDto.password,
      );

      const token = await userCredential.user.getIdToken();

      return { accessToken: token };
    } catch (error) {
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          throw new UnauthorizedException('E-mail ou senha inválidos.');
        case 'auth/user-disabled':
          throw new UnauthorizedException('Esta conta está desativada.');
        default:
          console.error('Erro inesperado no signIn:', error);
          throw new InternalServerErrorException('Ocorreu um erro ao tentar fazer login.');
      }
  }
}

  async signUp(
    signUpDto: SignUpDto,
  ): Promise<{ message: string }> {
    const { name, email, password, authorized, weight, height, birthday } =
      signUpDto;

    let newUserRecord: UserRecord;

    try {
      newUserRecord = await firebaseAdmin.auth().createUser({
        email,
        password,
        displayName: name,
        disabled: false,
      });
    } catch (error) {
       switch (error.code) {
        case 'auth/email-already-exists':
          throw new ConflictException('Este e-mail já está em uso.');
        case 'auth/invalid-password':
          throw new BadRequestException('A senha deve ter no mínimo 6 caracteres.');
        default:
          console.error('Erro ao criar usuário no Firebase Auth:', error);
          throw new InternalServerErrorException('Ocorreu um erro ao criar a conta.');
      }
    }

    try {
      await firestoreDb.collection('users').doc(newUserRecord.uid).set({
        name,
        email,
        authorized,
        weight,
        height,
        birthday,
        email_verified: false,
        status: 'pending_verification',
        role: 'patient',
        createdAt: new Date().toISOString(),
      });

      const actionCodeSettings = {
        url: this.emailVerificationUrl,
        handleCodeInApp: true,
      };

      const actionLink = await firebaseAdmin
        .auth()
        .generateEmailVerificationLink(email, actionCodeSettings);

      await this.emailService.sendCustomVerificationEmail(email, actionLink);

      return {
        message: 'Usuário criado com sucesso. Verifique seu e-mail para ativar a conta.',
      };
    } catch (error) {
      if (newUserRecord) {
        await firebaseAdmin.auth().deleteUser(newUserRecord.uid);
      }
      console.error('Erro na etapa de pós-criação (Firestore/E-mail):', error);
      throw new InternalServerErrorException('Ocorreu uma falha no processo de cadastro. Tente novamente.');
    }
  }

async verifyEmailAndActivateUser(actionCode: string): Promise<{ message: string }> {
  const firebaseRestUrl = `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${this.firebaseApiKey}`;

  try {
    const response = await axios.post(firebaseRestUrl, {
      oobCode: actionCode,
    });

    const uid = response.data.localId;
    if (!uid) {
      throw new Error('UID do usuário não retornado pela API do Firebase.');
    }

    await firestoreDb.collection('users').doc(uid).update({
      email_verified: true,
      status: 'active',
      updatedAt: new Date().toISOString(),
    });

    return { message: 'E-mail verificado com sucesso.' };
  } catch (error) {
    const firebaseError = error.response?.data?.error?.message;
      if (firebaseError === 'INVALID_OOB_CODE' || firebaseError === 'EXPIRED_OOB_CODE') {
        throw new BadRequestException('Link de verificação inválido ou expirado.');
      }
      console.error('Falha ao verificar e-mail:', error.response?.data || error.message);
      throw new InternalServerErrorException('Ocorreu um erro ao verificar o e-mail.');
    }
}

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const { email } = forgotPasswordDto;
    const auth = getAuth(this.firebaseConfigService.firebaseApp);

    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Erro ao solicitar redefinição de senha:', error);
    }
  }
}
