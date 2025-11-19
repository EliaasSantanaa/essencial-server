import { Controller, Post, Body, Delete, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatMessageDto } from './dto/chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * Endpoint principal do chat
   * POST /chat
   * Body: { "message": "Quais médicos especialistas em cardiologia?", "conversationId": "opcional" }
   */
  @Post()
  async chat(@Body() dto: ChatMessageDto) {
    return await this.chatService.chat(dto);
  }

  /**
   * Limpa o histórico de uma conversa
   * DELETE /chat/:conversationId
   */
  @Delete(':conversationId')
  clearConversation(@Param('conversationId') conversationId: string) {
    this.chatService.clearConversation(conversationId);
    return { message: 'Histórico limpo com sucesso' };
  }
}
