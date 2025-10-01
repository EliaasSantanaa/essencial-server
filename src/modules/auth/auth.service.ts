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
import { firebaseAdmin, firestoreDb } from '../../firebase/firebase-admin.config';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Injectable()
export class AuthService {
  constructor(private readonly firebaseConfigService: FirebaseConfigService) {}

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
      const newUser = await firestoreDb
        .collection('users')
        .doc(newUserRecord.uid)
        .set({
          name,
          email,
          authorized,
          role,
          weight,
          height,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      return {
        uid: newUserRecord.uid,
        email: newUserRecord.email || '',
        name: newUserRecord.displayName || '',
      };
    } catch (error) {
      await firebaseAdmin.auth().deleteUser(newUserRecord.uid);
      throw new InternalServerErrorException(
        'Ocorreu um erro ao salvar os dados do usuário.',
      );
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
