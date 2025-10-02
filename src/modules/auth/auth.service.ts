import {
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
      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential'
      ) {
        throw new UnauthorizedException('Credenciais inválidas.');
      }

      if (error.code === 'auth/user-disabled') {
        throw new UnauthorizedException(
          'Sua conta está desativada. Por favor, verifique seu e-mail para ativá-la.',
        );
      }

      throw new UnauthorizedException('Ocorreu um erro ao tentar fazer login.');
    }
  }

  async signUp(
    signUpDto: SignUpDto,
  ): Promise<{ uid: string; email: string; name: string }> {
    const { name, email, password, authorized, role, weight, height } =
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
      console.error('Erro ao criar usuário no Firebase Auth:', error);
      if (error.code === 'auth/email-already-exists') {
        throw new ConflictException('Este e-mail já está em uso.');
      }
      throw new InternalServerErrorException(
        'Ocorreu um erro ao criar o usuário no serviço de autenticação.',
      );
    }

    try {
       console.log('[PROD-DEBUG] Passo 1: Tentando salvar usuário no Firestore...');
      await firestoreDb.collection('users').doc(newUserRecord.uid).set({
        name,
        email,
        authorized,
        role,
        weight,
        height,
        email_verified: false,
        status: 'pending_verification',
        createdAt: new Date().toISOString(),
      });

      console.log('[PROD-DEBUG] Passo 2: Usuário salvo no Firestore com sucesso.');
      const actionCodeSettings = {
        url: this.emailVerificationUrl,
        handleCodeInApp: true,
      };

      console.log('[PROD-DEBUG] Passo 3: Gerando link de verificação...');
      const actionLink = await firebaseAdmin
        .auth()
        .generateEmailVerificationLink(email, actionCodeSettings);
        console.log('[PROD-DEBUG] Passo 4: Link gerado com sucesso. Tentando enviar e-mail...');


      await this.emailService.sendCustomVerificationEmail(email, actionLink);
      console.log('[PROD-DEBUG] Passo 5: E-mail enviado com sucesso! Fim do TRY.');

      return {
        uid: newUserRecord.uid,
        email: newUserRecord.email || '',
        name: newUserRecord.displayName || '',
      };
    } catch (error) {
      console.error('[PROD-DEBUG] ERRO CAPTURADO NO BLOCO CATCH!', error);
      await firebaseAdmin.auth().deleteUser(newUserRecord.uid);
      throw new InternalServerErrorException(
        'Ocorreu um erro ao salvar os dados do usuário.',
      );
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
    console.error('Falha ao verificar e-mail:', error.response?.data || error.message);
    const firebaseError = error.response?.data?.error?.message;
    if (firebaseError === 'INVALID_OOB_CODE' || firebaseError === 'EXPIRED_OOB_CODE') {
      throw new InternalServerErrorException('Link de verificação inválido ou expirado.');
    }
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
