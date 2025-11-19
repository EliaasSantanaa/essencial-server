# 📅 Guia Rápido: Agendamento por Chat

## 🎯 Como Funciona

O chatbot consegue **agendar consultas automaticamente** de 3 formas:

### 1️⃣ **Agendamento Completo (em uma mensagem)**
```json
{
  "message": "Quero agendar com Dr. João Silva dia 2025-11-20 às 14:30"
}
```
✅ Cria o agendamento imediatamente

---

### 2️⃣ **Agendamento Parcial (IA coleta o resto)**
```json
{
  "message": "Preciso marcar uma consulta com cardiologista"
}
```
🤖 IA pergunta: data e horário

```json
{
  "message": "Dia 25 de novembro às 15h",
  "conversationId": "conv_123..."
}
```
✅ Completa e cria o agendamento

---

### 3️⃣ **Agendamento Zero (IA coleta tudo)**
```json
{
  "message": "Quero marcar uma consulta"
}
```
🤖 IA pergunta: médico/especialidade, data e horário

O usuário responde conversacionalmente e a IA vai coletando os dados até ter tudo.

---

## 📋 Dados Necessários

Para criar um agendamento, são necessários:

1. **Data** (formato: YYYY-MM-DD)
   - Exemplos aceitos: "2025-11-20", "dia 20", "amanhã", "próxima segunda"

2. **Horário** (formato: HH:MM)
   - Exemplos aceitos: "14:30", "14h30", "2 da tarde"

3. **Médico/Especialista**
   - Nome do médico: "Dr. João Silva"
   - OU Especialidade: "cardiologista"

---

## 🔄 Fluxo Inteligente

```
Usuário: "Quero marcar consulta"
   ↓
IA: Identifica → create_appointment
   ↓
IA: Verifica dados faltantes → [data, hora, médico]
   ↓
IA: "Para agendar, preciso saber com qual médico, data e horário"
   ↓
Usuário: "Com Dr. João no dia 20"
   ↓
IA: Atualiza → {specialist: "Dr. João", date: "2025-11-20"}
   ↓
IA: Verifica faltantes → [hora]
   ↓
IA: "Perfeito! Só falta o horário. Qual você prefere?"
   ↓
Usuário: "15h"
   ↓
IA: Completa → {specialist: "Dr. João", date: "2025-11-20", hour: "15:00"}
   ↓
✅ CRIA AGENDAMENTO NO FIRESTORE
   ↓
IA: "✅ Consulta agendada com sucesso! ..."
```

---

## 🧪 Testes no Postman

### Teste 1: Agendamento Completo
```http
POST http://localhost:3001/chat
Content-Type: application/json

{
  "message": "Agendar consulta Dr. João Silva 2025-11-25 14:00"
}
```

### Teste 2: Agendamento Conversacional
```http
# Passo 1
POST http://localhost:3001/chat
{
  "message": "Quero marcar consulta"
}

# Passo 2 (use o conversationId retornado)
POST http://localhost:3001/chat
{
  "message": "Com cardiologista dia 20",
  "conversationId": "conv_..."
}

# Passo 3
POST http://localhost:3001/chat
{
  "message": "Às 15h",
  "conversationId": "conv_..."
}
```

---

## ✅ Resposta de Sucesso

```json
{
  "response": "✅ Consulta agendada com sucesso!\n\n📅 Data: 2025-11-20\n⏰ Horário: 15:00\n👨‍⚕️ Médico: Dr. João Silva\n\nID do agendamento: abc123",
  "conversationId": "conv_...",
  "timestamp": "2025-11-14T...",
  "data": {
    "appointment": {
      "id": "abc123",
      "date": "2025-11-20T00:00:00.000Z",
      "hour": "15:00",
      "specialist": "Dr. João Silva",
      "status": "scheduled",
      "createdAt": "..."
    },
    "created": true
  }
}
```

---

## 🔍 Dados Armazenados no Firestore

Collection: `appointments`

```javascript
{
  date: Date,              // Data da consulta
  hour: String,            // Horário (HH:MM)
  specialist: String,      // Nome do médico
  doctorId: String | null, // ID do médico (se identificado)
  status: "scheduled",     // Status do agendamento
  createdAt: Date,         // Quando foi criado
  updatedAt: Date          // Última atualização
}
```

---

## 💡 Dicas

1. **Use conversationId**: Mantém o contexto e os dados parciais
2. **Linguagem natural**: A IA entende "amanhã", "próxima segunda", etc
3. **Flexível**: Pode informar os dados em qualquer ordem
4. **Sugere médicos**: Se pedir especialidade, mostra médicos disponíveis

---

## 🐛 Troubleshooting

**IA não entende a data?**
→ Use formato: YYYY-MM-DD ou "dia 20 de novembro"

**Agendamento não é criado?**
→ Verifique se todos os 3 dados foram fornecidos

**Perdeu o contexto?**
→ Sempre use o `conversationId` retornado

---

## 🎨 Personalizações

No arquivo `chat.service.ts`, você pode:

- Adicionar validações (horários disponíveis, médico existe, etc)
- Integrar com calendário
- Enviar e-mail de confirmação
- Adicionar mais campos (motivo da consulta, paciente, etc)
