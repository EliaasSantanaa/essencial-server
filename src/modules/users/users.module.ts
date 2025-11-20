import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { AuthGuard } from '../../guards/auth.guard';

@Module({
  imports: [FirebaseModule],  
  controllers: [UsersController],
  providers: [UsersService, AuthGuard],
  exports: [UsersService],
})
export class UsersModule {}
