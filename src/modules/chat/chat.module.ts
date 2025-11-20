import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { AuthGuard } from 'src/guards/auth.guard';

@Module({
  controllers: [ChatController],
  providers: [ChatService, AuthGuard],
  exports: [ChatService],
})
export class ChatModule {}
