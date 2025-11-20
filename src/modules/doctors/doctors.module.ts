import { Module } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { DoctorsController } from './doctors.controller';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { AuthGuard } from '../../guards/auth.guard';

@Module({
  imports: [FirebaseModule],
  controllers: [DoctorsController],
  providers: [DoctorsService, AuthGuard],
  exports: [DoctorsService],
})
export class DoctorsModule {}
