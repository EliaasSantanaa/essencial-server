
import { Controller, Post, Body, Delete, Param, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatMessageDto, ChatResponseDto } from './dto/chat.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../guards/auth.guard';

/**
 * ChatController - Assistente Virtual da Clínica Essencial
 *
 * Esta controller expõe endpoints para interação com o agente de IA do sistema.
 *
 * ## Funcionalidades
 * - Envie perguntas em linguagem natural sobre médicos, agendamentos, usuários e estatísticas.
 * - O agente de IA entende o contexto, busca dados no sistema e responde de forma natural.
 * - Use o campo `conversationId` para manter o contexto entre múltiplas mensagens.
 *
 * ## Como usar
 * 1. Envie um POST para `/chat` com o campo `message` (e opcionalmente `conversationId`).
 * 2. Receba uma resposta detalhada, dados consultados e o ID da conversa.
 * 3. Para limpar o histórico, envie um DELETE para `/chat/:conversationId`.
 *
 * ### Exemplo de requisição
 * ```json
 * {
 *   "message": "Quais médicos especialistas em cardiologia?"
 * }
 * ```
 *
 * ### Exemplo de resposta
 * ```json
 * {
 *   "response": "Olá! Sou o Assistente Virtual da Clínica Essencial. \n\nPosso te ajudar com:\n• 📋 Consultar médicos cadastrados e especialidades\n• 📅 Verificar agendamentos do sistema\n• 👥 Listar usuários cadastrados\n• 📊 Fornecer estatísticas gerais\n\nComo posso ajudar você hoje?",
 *   "conversationId": "conv_1763599191102_xg1bn9x9g",
 *   "timestamp": "2025-11-20T00:39:51.828Z",
 *   "data": {
 *     "capabilities": [
 *       "Consultar médicos cadastrados e suas especialidades",
 *       "Verificar agendamentos do sistema",
 *       "Listar usuários cadastrados",
 *       "Fornecer estatísticas gerais do sistema"
 *     ]
 *   }
 * }
 * ```
 */
@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Envia uma mensagem ao assistente virtual (IA).',
    description: `Este endpoint permite interagir com o Assistente Virtual da Clínica Essencial usando linguagem natural.
    
    Como usar:
    - Envie perguntas sobre médicos, agendamentos, usuários ou estatísticas.
    - O agente de IA entende o contexto, busca dados no sistema e responde de forma natural.
    - Use o campo 'conversationId' para manter o contexto entre múltiplas mensagens.
    
    
    Exemplo de requisição:
    {
      "message:" "Quais médicos especialistas em cardiologia?"
    }

    ----------------------------------------------------------------------------------------
      
    Exemplo de resposta:
    {
    "response": 
      "Olá! Sou o Assistente Virtual da Clínica Essencial. Posso te ajudar com:
        • 📋 Consultar médicos cadastrados e especialidades
        • 📅 Verificar agendamentos do sistema
        • 👥 Listar usuários cadastrados
        • 📊 Fornecer estatísticas gerais
        
      Como posso ajudar você hoje?",
      "conversationId": "conv_1763599191102_xg1bn9x9g",
      "timestamp": "2025-11-20T00:39:51.828Z",
      "data": {
        "capabilities": [
            "Consultar médicos cadastrados e suas especialidades",
            "Verificar agendamentos do sistema",
            "Listar usuários cadastrados",
            "Fornecer estatísticas gerais do sistema"
          ]
        }
      }
    `
  })
  @ApiBody({ type: ChatMessageDto })
  @ApiResponse({ status: 200, description: 'Resposta do assistente virtual.', type: ChatResponseDto })
  async chat(@Body() dto: ChatMessageDto): Promise<ChatResponseDto> {
    return await this.chatService.chat(dto);
  }

  @Delete(':conversationId')
  @ApiOperation({ summary: 'Limpa o histórico de uma conversa.' })
  @ApiParam({ name: 'conversationId', description: 'ID da conversa a ser limpa.' })
  @ApiResponse({ status: 200, description: 'Histórico limpo com sucesso.' })
  clearConversation(@Param('conversationId') conversationId: string) {
    this.chatService.clearConversation(conversationId);
    return { message: 'Histórico limpo com sucesso' };
  }
}
