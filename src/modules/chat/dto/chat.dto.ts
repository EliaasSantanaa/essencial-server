export class ChatMessageDto {
  message: string;
  conversationId?: string; // Opcional: para manter contexto da conversa
}

export class ChatResponseDto {
  response: string;
  conversationId: string;
  timestamp: Date;
  data?: any; // Dados retornados do banco, se houver
}
