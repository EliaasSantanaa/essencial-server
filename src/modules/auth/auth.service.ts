import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { FirebaseConfigService } from 'src/firebase/firebase.config';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { SignUpDto } from './dto/sign-up.dto';
import { sign } from 'crypto';
import { UserRecord } from 'firebase-admin/auth';
import { firebaseAdmin, firestoreDb } from 'src/firebase/firebase-admin.config';
import { create } from 'domain';

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
    const { name, email, password } = signUpDto;

    let newUserRecord: UserRecord;

    try {
      newUserRecord = await firebaseAdmin.auth().createUser({
        email,
        password,
        displayName: name,
      });
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        throw new ConflictException('Este e-mail já está em uso.');
      }
      throw new InternalServerErrorException(
        'Ocorreu um erro ao criar o usuário no serviço de autenticação.',
      );
    }

    try {
      await firestoreDb.collection('users')
        .doc(newUserRecord.uid)
        .set({
          name,
          email,
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
}
