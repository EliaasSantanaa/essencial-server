import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PatientModule } from 'src/modules/patient/patient.module';
import { DoctorModule } from 'src/modules/doctor/doctor.module';

@Module({
  imports: [
    ConfigModule
    .forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PatientModule,
    DoctorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
