import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DoctorModule } from '../modules/doctor/doctor.module';
import { AuthModule } from '../modules/auth/auth.module';
import { FirebaseModule } from '../firebase/firebase.module';
import { EmailModule } from '../modules/email/email.module';
import { UsersModule } from '../modules/users/users.module';

@Module({
  imports: [
    ConfigModule
    .forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DoctorModule,
    AuthModule,
    FirebaseModule,
    EmailModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
