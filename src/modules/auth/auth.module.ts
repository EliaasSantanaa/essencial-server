import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FirebaseModule } from '../../firebase/firebase.module';
import { EmailModule } from '../email/email.module';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';

@Module({
  imports: [FirebaseModule, EmailModule],
  providers: [
    AuthService,
    FirebaseAuthGuard,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
