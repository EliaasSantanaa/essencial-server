import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [FirebaseModule],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
  controllers: [AppointmentsController],
})
export class AppointmentsModule {}
