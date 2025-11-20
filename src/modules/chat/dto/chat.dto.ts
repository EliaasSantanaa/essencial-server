
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatMessageDto {
  @ApiProperty({ example: 'Quais médicos especialistas em cardiologia?', description: 'Mensagem enviada pelo usuário.' })
  message: string;

  @ApiPropertyOptional({ example: 'conv_123456789', description: 'ID da conversa para manter o contexto.' })
  conversationId?: string;
}

export class ChatResponseDto {
  @ApiProperty({ example: 'Lista de médicos especialistas em cardiologia...', description: 'Resposta gerada pelo assistente virtual.' })
  response: string;

  @ApiProperty({ example: 'conv_123456789', description: 'ID da conversa.' })
  conversationId: string;

  @ApiProperty({ example: '2025-11-19T12:34:56.789Z', description: 'Data e hora da resposta.' })
  timestamp: Date;

  @ApiPropertyOptional({ description: 'Dados retornados do banco, se houver.' })
  data?: any;
}
