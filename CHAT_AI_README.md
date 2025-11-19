# 🤖 Chat com IA - Integração com Firestore

## 📋 O que foi implementado?

Um chatbot inteligente que:
- ✅ Entende perguntas em linguagem natural
- ✅ Busca dados no Firestore (médicos, consultas)
- ✅ **Agenda consultas automaticamente**
- ✅ Coleta dados faltantes conversacionalmente
- ✅ Mantém contexto da conversa
- ✅ 100% gratuito usando Groq API

---

## 🚀 Como Configurar

### 1. Obter API Key do Groq (Gratuito)

1. Acesse: https://console.groq.com
2. Crie uma conta (grátis)
3. Vá em "API Keys" e crie uma nova chave
4. Copie a chave

### 2. Adicionar no arquivo `.env`

```env
GROQ_API_KEY=sua_chave_aqui
```

### 3. Testar o Chat

Inicie o servidor:
```bash
npm run start:dev
```

---

## 🧪 Exemplos de Uso

### Exemplo 1: Listar Médicos

**Request:**
```bash
POST http://localhost:3000/chat
Content-Type: application/json

{
  "message": "Quais médicos você tem disponíveis?"
}
```

**Response:**
```json
{
  "response": "Temos os seguintes médicos disponíveis:\n\n1. Dr. João Silva - Cardiologista\n2. Dra. Maria Santos - Dermatologista\n3. Dr. Pedro Oliveira - Ortopedista\n\nGostaria de mais informações sobre algum deles?",
  "conversationId": "conv_1234567890_abc123",
  "timestamp": "2025-11-14T10:30:00.000Z",
  "data": [
    {
      "id": "doc1",
      "name": "Dr. João Silva",
      "specialty": "Cardiologia"
    }
  ]
}
```

### Exemplo 2: Buscar Médico Específico

**Request:**
```bash
POST http://localhost:3000/chat
Content-Type: application/json

{
  "message": "Tem algum cardiologista disponível?",
  "conversationId": "conv_1234567890_abc123"
}
```

**Response:**
```json
{
  "response": "Sim! Temos o Dr. João Silva, especialista em Cardiologia. Ele está disponível para consultas. Gostaria de agendar?",
  "conversationId": "conv_1234567890_abc123",
  "timestamp": "2025-11-14T10:31:00.000Z",
  "data": [
    {
      "id": "doc1",
      "name": "Dr. João Silva",
      "specialty": "Cardiologia",
      "crm": "12345"
    }
  ]
}
```

### Exemplo 4: **Agendar Consulta (Completo)**

**Request:**
```bash
POST http://localhost:3000/chat
Content-Type: application/json

{
  "message": "Quero agendar uma consulta com Dr. João Silva no dia 2025-11-20 às 14:30"
}
```

**Response:**
```json
{
  "response": "✅ Consulta agendada com sucesso!\n\n📅 Data: 2025-11-20\n⏰ Horário: 14:30\n👨‍⚕️ Médico: Dr. João Silva\n\nID do agendamento: appt123456\n\nDeseja agendar mais alguma consulta?",
  "conversationId": "conv_1234567890_xyz789",
  "timestamp": "2025-11-14T10:35:00.000Z",
  "data": {
    "appointment": {
      "id": "appt123456",
      "date": "2025-11-20",
      "hour": "14:30",
      "specialist": "Dr. João Silva"
    },
    "created": true
  }
}
```

### Exemplo 5: **Agendar Consulta (Coleta Conversacional)**

**Request 1:**
```bash
POST http://localhost:3000/chat
Content-Type: application/json

{
  "message": "Quero marcar uma consulta"
}
```

**Response 1:**
```json
{
  "response": "Claro! Vou te ajudar a agendar uma consulta. Para isso, preciso de algumas informações:\n\n1. Qual médico ou especialidade você deseja?\n2. Qual data prefere?\n3. Qual horário?\n\nTemos os seguintes médicos disponíveis:\n- Dr. João Silva (Cardiologia)\n- Dra. Maria Santos (Dermatologia)\n\nQual você prefere?",
  "conversationId": "conv_1234567890_abc123",
  "data": {
    "pendingAppointment": {},
    "missingFields": ["data", "horário", "médico/especialista"],
    "availableDoctors": [...]
  }
}
```

**Request 2 (continua a conversa):**
```bash
POST http://localhost:3000/chat
Content-Type: application/json

{
  "message": "Dr. João Silva, dia 20 de novembro",
  "conversationId": "conv_1234567890_abc123"
}
```

**Response 2:**
```json
{
  "response": "Perfeito! Dr. João Silva no dia 2025-11-20. Só falta o horário. Qual horário você prefere?",
  "conversationId": "conv_1234567890_abc123",
  "data": {
    "pendingAppointment": {
      "specialist": "Dr. João Silva",
      "date": "2025-11-20"
    },
    "missingFields": ["horário"]
  }
}
```

**Request 3 (finaliza):**
```bash
POST http://localhost:3000/chat
Content-Type: application/json

{
  "message": "Às 15:00",
  "conversationId": "conv_1234567890_abc123"
}
```

**Response 3:**
```json
{
  "response": "✅ Consulta agendada com sucesso!\n\n📅 Data: 2025-11-20\n⏰ Horário: 15:00\n👨‍⚕️ Médico: Dr. João Silva",
  "conversationId": "conv_1234567890_abc123",
  "data": {
    "appointment": { ... },
    "created": true
  }
}
```

### Exemplo 6: Pergunta Geral

**Request:**
```bash
POST http://localhost:3000/chat
Content-Type: application/json

{
  "message": "Qual o horário de funcionamento?"
}
```

**Response:**
```json
{
  "response": "Nossa clínica funciona de segunda a sexta, das 8h às 18h, e aos sábados das 8h às 12h. Posso ajudar com mais alguma coisa?",
  "conversationId": "conv_1234567890_xyz789",
  "timestamp": "2025-11-14T10:32:00.000Z"
}
```

### Exemplo 7: Limpar Histórico

**Request:**
```bash
DELETE http://localhost:3000/chat/conv_1234567890_abc123
```

**Response:**
```json
{
  "message": "Histórico limpo com sucesso"
}
```

---

## 🔧 Como Funciona (Arquitetura)

```
┌─────────────┐
│   Usuário   │
└──────┬──────┘
       │ 1. Envia mensagem
       ▼
┌─────────────────┐
│  Chat Controller│
└────────┬────────┘
         │ 2. Processa
         ▼
┌──────────────────────────────┐
│      Chat Service            │
│                              │
│  ┌────────────────────────┐ │
│  │ 1. Analisa Intenção    │ │ ◄─── Groq IA (Llama 3)
│  │    (o que o user quer) │ │
│  └────────────────────────┘ │
│                              │
│  ┌────────────────────────┐ │
│  │ 2. Busca no Firestore  │ │ ◄─── Firebase
│  │    (médicos, consultas)│ │
│  └────────────────────────┘ │
│                              │
│  ┌────────────────────────┐ │
│  │ 3. Gera Resposta       │ │ ◄─── Groq IA (Llama 3)
│  │    (com contexto)      │ │
│  └────────────────────────┘ │
└──────────────────────────────┘
         │ 3. Retorna resposta
         ▼
┌─────────────┐
│   Usuário   │
└─────────────┘
```

---

## 🎯 Fluxo de Processamento

1. **Análise de Intenção**: IA identifica o que o usuário quer
   - `list_doctors`: Listar médicos
   - `search_doctor`: Buscar médico específico
   - `list_appointments`: Ver consultas
   - `create_appointment`: **Agendar consulta** 🆕
   - `general_question`: Pergunta geral

2. **Busca de Dados**: Busca informações relevantes no Firestore

3. **Processamento de Agendamento** (se aplicável):
   - Coleta dados: data, horário, médico
   - Se faltar informação, pergunta conversacionalmente
   - Quando completo, cria no Firestore

4. **Geração de Resposta**: IA gera resposta natural usando os dados

5. **Contexto**: Mantém histórico das últimas 5 interações

---

## 📊 Estrutura de Dados

### Entrada (ChatMessageDto)
```typescript
{
  message: string;          // Mensagem do usuário
  conversationId?: string;  // ID da conversa (opcional)
}
```

### Saída (ChatResponseDto)
```typescript
{
  response: string;         // Resposta da IA
  conversationId: string;   // ID da conversa
  timestamp: Date;          // Quando foi processado
  data?: any;              // Dados do banco (se houver)
}
```

---

## 🔄 Alternativas de IA

### Opção 1: Groq (Atual - Recomendado para começar)
✅ Gratuito (30 req/min)
✅ Rápido
✅ Fácil de configurar
❌ Requer internet

### Opção 2: Ollama (100% Local)
✅ Totalmente gratuito
✅ Privacidade total
✅ Sem limites de requisição
❌ Requer instalação local
❌ Precisa de GPU/RAM

**Como migrar para Ollama:**

1. Instale: https://ollama.ai
2. Baixe um modelo:
```bash
ollama pull llama3.1
```
3. Mude o código para usar:
```bash
npm install ollama
```
4. Substitua Groq por Ollama no `chat.service.ts`

### Opção 3: OpenAI (Pago)
✅ Mais poderoso
❌ Custa dinheiro ($)

---

## 🎨 Melhorias Futuras

- [ ] Adicionar streaming de resposta (resposta em tempo real)
- [ ] Suporte a anexos/imagens
- [ ] Integração com WhatsApp/Telegram
- [ ] Cache de respostas comuns
- [ ] Analytics de conversas
- [ ] Treinar modelo customizado

---

## 🐛 Troubleshooting

### Erro: "Invalid API Key"
- Verifique se adicionou `GROQ_API_KEY` no `.env`
- Confirme que a chave está correta em https://console.groq.com

### Erro: "Rate limit exceeded"
- Groq free tem limite de 30 req/min
- Aguarde 1 minuto ou migre para Ollama (sem limites)

### IA não encontra dados
- Verifique se há dados no Firestore
- Teste as queries direto no Firestore
- Adicione logs para debug

---

## 📚 Recursos

- [Groq Docs](https://console.groq.com/docs)
- [Ollama](https://ollama.ai)
- [Llama 3 Model](https://ai.meta.com/llama/)

---

## 💡 Dicas

1. **Teste com mensagens variadas** para ver como a IA entende
2. **Mantenha prompts claros** no `chat.service.ts`
3. **Ajuste a temperatura** (0-1) para respostas mais criativas ou precisas
4. **Use conversationId** para manter contexto entre mensagens

---

## 🤝 Suporte

Dúvidas? Edite os prompts no arquivo `chat.service.ts` para customizar o comportamento da IA!
