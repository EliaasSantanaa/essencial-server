import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PatientModule } from '../modules/patient/patient.module';
import { DoctorModule } from '../modules/doctor/doctor.module';
import { AuthModule } from '../modules/auth/auth.module';
import { FirebaseModule } from '../firebase/firebase.module';
import { EmailModule } from '../modules/email/email.module';
import { AiAgentModule } from 'src/modules/ai-agent/ai-agent.module';

@Module({
  imports: [
    ConfigModule
    .forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PatientModule,
    DoctorModule,
    AuthModule,
    FirebaseModule,
    EmailModule,
    AiAgentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
