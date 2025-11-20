import { Injectable, Logger } from '@nestjs/common';
import Groq from 'groq-sdk';
import { firestoreDb } from '../../firebase/firebase-admin.config';
import { ChatMessageDto, ChatResponseDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private groq: Groq;
  private conversationHistory: Map<string, any[]> = new Map();

  constructor() {
    // Inicializa o cliente Groq com a API key
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  /**
   * Processa a mensagem do usuário e retorna a resposta da IA
   */
  async chat(dto: ChatMessageDto): Promise<ChatResponseDto> {
    const conversationId = dto.conversationId || this.generateConversationId();
    
    try {
      // 1. Analisa a intenção do usuário usando IA
      const intent = await this.analyzeIntent(dto.message);
      
      // 2. Busca dados relevantes no Firestore baseado na intenção
      const contextData = await this.fetchRelevantData(intent);
      
      // 3. Monta o histórico da conversa
      const history = this.conversationHistory.get(conversationId) || [];
      
      // 4. Gera resposta usando a IA com contexto
      const aiResponse = await this.generateResponse(
        dto.message,
        contextData,
        history,
        intent
      );
      
      // 5. Atualiza o histórico
      history.push(
        { role: 'user', content: dto.message },
        { role: 'assistant', content: aiResponse }
      );
      this.conversationHistory.set(conversationId, history.slice(-10)); // Mantém apenas últimas 5 trocas
      
      return {
        response: aiResponse,
        conversationId,
        timestamp: new Date(),
        data: contextData,
      };
    } catch (error) {
      this.logger.error('Erro ao processar chat:', error);
      
      // Retorna resposta amigável em caso de erro
      return {
        response: 'Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente? Se o problema persistir, tente reformular sua pergunta.',
        conversationId,
        timestamp: new Date(),
        data: { error: error.message },
      };
    }
  }

  /**
   * Analisa a intenção do usuário (o que ele quer fazer)
   */
  private async analyzeIntent(message: string): Promise<{
    action: 'list_doctors' | 'list_appointments' | 'search_doctor' | 'list_users' | 'count_statistics' | 'greeting' | 'help' | 'general_question';
    entities: any;
  }> {
    const completion = await this.groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Você é um assistente que analisa mensagens de usuários de um sistema de clínica médica.
Identifique a intenção e extraia entidades relevantes.

Possíveis intenções:
- greeting: saudação (olá, oi, bom dia, etc)
- help: usuário pergunta o que o assistente faz
- list_doctors: usuário quer ver lista de médicos
- search_doctor: usuário busca médico específico (por nome, especialidade, etc)
- list_appointments: usuário quer ver consultas/agendamentos
- list_users: usuário quer ver usuários cadastrados
- count_statistics: usuário quer saber quantidades (quantos médicos, quantos agendamentos, etc)
- general_question: pergunta geral

Para list_appointments e count_statistics, extraia:
- date: data no formato YYYY-MM-DD (se mencionada, ex: "hoje", "amanhã", "dia 20")

IMPORTANTE: Responda APENAS com o objeto JSON, sem formatação markdown, sem \`\`\`json, sem explicações.

Formato obrigatório:
{"action":"action_name","entities":{"specialty":"valor se houver","doctorName":"valor se houver","date":"YYYY-MM-DD se houver"}}`,
        },
        {
          role: 'user',
          content: 'Olá',
        },
        {
          role: 'assistant',
          content: '{"action":"greeting","entities":{}}',
        },
        {
          role: 'user',
          content: message,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      max_tokens: 300,
      response_format: { type: 'json_object' },
    });

    const response = completion.choices[0]?.message?.content || '{}';
    
    // Remove markdown code blocks se existirem
    let jsonString = response.trim();
    if (jsonString.startsWith('```')) {
      // Remove ```json ou ``` no início e ``` no final
      jsonString = jsonString.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    }
    
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      this.logger.error('Erro ao fazer parse do JSON da IA:', error);
      this.logger.error('Resposta recebida:', response);
      // Retorna intent padrão em caso de erro
      return {
        action: 'general_question',
        entities: {},
      };
    }
  }

  /**
   * Busca dados relevantes no Firestore baseado na intenção
   */
  private async fetchRelevantData(intent: any): Promise<any> {
    const { action, entities } = intent;

    switch (action) {
      case 'list_doctors':
      case 'search_doctor':
        return {
          doctors: await this.searchDoctors(entities),
          totalDoctors: await this.countDoctors(),
          specialties: await this.getSpecialties(),
        };
      
      case 'list_appointments':
        return {
          appointments: await this.searchAppointments(entities),
          totalAppointments: await this.countAppointments(entities.date),
        };
      
      case 'list_users':
        return {
          users: await this.searchUsers(),
          totalUsers: await this.countUsers(),
        };
      
      case 'count_statistics':
        return {
          totalDoctors: await this.countDoctors(),
          totalAppointments: await this.countAppointments(entities.date),
          totalUsers: await this.countUsers(),
          specialties: await this.getSpecialties(),
        };
      
      case 'greeting':
      case 'help':
        return {
          capabilities: [
            'Consultar médicos cadastrados e suas especialidades',
            'Verificar agendamentos do sistema',
            'Listar usuários cadastrados',
            'Fornecer estatísticas gerais do sistema',
          ],
        };
      
      default:
        return null;
    }
  }

  /**
   * Busca médicos no Firestore
   */
  private async searchDoctors(entities: any): Promise<any> {
    const doctorsRef = firestoreDb.collection('doctors');
    let query: any = doctorsRef;

    // Filtra por especialidade se informada
    if (entities.specialty) {
      query = query.where('specialty', '==', entities.specialty);
    }

    const snapshot = await query.get();
    const doctors = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Se buscar por nome, filtra localmente
    if (entities.doctorName) {
      const nameLower = entities.doctorName.toLowerCase();
      return doctors.filter(doc => 
        doc.name?.toLowerCase().includes(nameLower)
      );
    }

    return doctors;
  }

  /**
   * Busca consultas no Firestore
   */
  private async searchAppointments(entities: any): Promise<any> {
    const appointmentsRef = firestoreDb.collection('appointments');
    let query: any = appointmentsRef;

    // Filtra por data se informada
    if (entities.date) {
      const startDate = new Date(entities.date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(entities.date);
      endDate.setHours(23, 59, 59, 999);
      
      query = query
        .where('date', '>=', startDate)
        .where('date', '<=', endDate);
    }

    const snapshot = await query.limit(50).get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  /**
   * Busca usuários no Firestore
   */
  private async searchUsers(): Promise<any> {
    const usersSnapshot = await firestoreDb.collection('users').limit(50).get();
    
    return usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  /**
   * Conta total de médicos
   */
  private async countDoctors(): Promise<number> {
    const snapshot = await firestoreDb.collection('doctors').count().get();
    return snapshot.data().count;
  }

  /**
   * Conta total de agendamentos
   */
  private async countAppointments(date?: string): Promise<number> {
    let query: any = firestoreDb.collection('appointments');

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      query = query
        .where('date', '>=', startDate)
        .where('date', '<=', endDate);
    }

    const snapshot = await query.count().get();
    return snapshot.data().count;
  }

  /**
   * Conta total de usuários
   */
  private async countUsers(): Promise<number> {
    const snapshot = await firestoreDb.collection('users').count().get();
    return snapshot.data().count;
  }

  /**
   * Obtém lista de especialidades disponíveis
   */
  private async getSpecialties(): Promise<string[]> {
    const snapshot = await firestoreDb.collection('doctors').get();
    const specialties = new Set<string>();
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.specialty) {
        specialties.add(data.specialty);
      }
    });
    
    return Array.from(specialties);
  }

  /**
   * Gera resposta usando a IA com contexto dos dados
   */
  private async generateResponse(
    userMessage: string,
    contextData: any,
    history: any[],
    intent: any
  ): Promise<string> {
    let systemPrompt = `Você é o Assistente Virtual da Clínica Essencial, um sistema de informações médicas desenvolvido como projeto acadêmico.

## SUAS CAPACIDADES:

1. **Consultar Médicos**: Listar todos os médicos, buscar por especialidade ou nome
2. **Consultar Agendamentos**: Ver agendamentos cadastrados, filtrar por data
3. **Consultar Usuários**: Listar usuários cadastrados no sistema
4. **Estatísticas**: Fornecer números totais (quantos médicos, agendamentos, usuários)

## IMPORTANTE:
- Você NÃO cria, edita ou deleta dados
- Você APENAS consulta e informa dados existentes
- Seja profissional, cordial e objetivo
- Use os dados fornecidos para responder com precisão
- Se não houver dados, informe de forma clara

## QUANDO CUMPRIMENTADO (Olá, Oi, Bom dia):
Responda de forma amigável E apresente suas funcionalidades:
"Olá! Sou o Assistente Virtual da Clínica Essencial. 

Posso te ajudar com:
• 📋 Consultar médicos cadastrados e especialidades
• 📅 Verificar agendamentos do sistema
• 👥 Listar usuários cadastrados
• 📊 Fornecer estatísticas gerais

Como posso ajudar você hoje?"`;

    // Adiciona dados do sistema se houver
    if (contextData) {
      systemPrompt += `\n\n## DADOS DO SISTEMA:\n${JSON.stringify(contextData, null, 2)}`;
    }

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: userMessage },
    ];

    const completion = await this.groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
    });

    return completion.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';
  }

  /**
   * Gera um ID único para a conversa
   */
  private generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Limpa o histórico de uma conversa
   */
  clearConversation(conversationId: string): void {
    this.conversationHistory.delete(conversationId);
  }
}
