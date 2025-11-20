import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { ResendModule } from '../resend/resend.module';
import { AuthGuard } from 'src/guards/auth.guard';

@Module({
  imports: [FirebaseModule, ResendModule],
  providers: [AppointmentsService, AuthGuard],
  exports: [AppointmentsService],
  controllers: [AppointmentsController],
})
export class AppointmentsModule {}
