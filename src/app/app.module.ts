import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../modules/auth/auth.module';
import { FirebaseModule } from '../firebase/firebase.module';
import { EmailModule } from '../modules/email/email.module';
import { UsersModule } from '../modules/users/users.module';
import { AppointmentsModule } from '../modules/appointments/appointments.module';
import { DoctorsModule } from '../modules/doctors/doctors.module';
import { ResendModule } from '../modules/resend/resend.module';

@Module({
  imports: [
    ConfigModule
    .forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DoctorsModule,
    AuthModule,
    FirebaseModule,
    EmailModule,
    UsersModule,
    AppointmentsModule,
    ResendModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
