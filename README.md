<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<h1 align="center">Clínica Essencial - API Backend</h1>

<p align="center">
  Sistema de gerenciamento de clínica médica desenvolvido como projeto acadêmico integrando todas as disciplinas do semestre
</p>

---

## 📋 Sobre o Projeto

**Clínica Essencial** é uma API REST completa para gerenciamento de clínicas médicas, desenvolvida como **projeto de apresentação na faculdade**, integrando conhecimentos de múltiplas matérias semestrais:

- 🏗️ **Engenharia de Software**: Arquitetura em camadas, padrões de projeto
- 💾 **Banco de Dados**: Firestore (NoSQL), modelagem de dados
- 🔐 **Segurança**: Autenticação JWT, Firebase Authentication
- 🤖 **Inteligência Artificial**: Chatbot com IA para consultas (Groq/Llama)
- 🌐 **Desenvolvimento Web**: API RESTful, documentação Swagger
- 📧 **Integração**: SendGrid para e-mails, AWS Cognito

---

## 🚀 Tecnologias Utilizadas

### Core
- **[NestJS](https://nestjs.com/)** - Framework Node.js progressivo
- **[TypeScript](https://www.typescriptlang.org/)** - Linguagem tipada
- **[Node.js](https://nodejs.org/)** - Runtime JavaScript

### Banco de Dados & Autenticação
- **[Firebase Firestore](https://firebase.google.com/docs/firestore)** - Banco de dados NoSQL
- **[Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)** - Gerenciamento servidor
- **[AWS Cognito](https://aws.amazon.com/cognito/)** - Autenticação de usuários

### Inteligência Artificial
- **[Groq SDK](https://console.groq.com/)** - API de IA ultrarrápida
- **[Llama 3.3](https://ai.meta.com/llama/)** - Modelo de linguagem open-source

### Serviços Externos
- **[SendGrid](https://sendgrid.com/)** - Envio de e-mails transacionais
- **[Vercel](https://vercel.com/)** - Deploy e hospedagem

---

## 📦 Funcionalidades

### 1. Gestão de Médicos
- ✅ Cadastro de médicos
- ✅ Listagem e busca
- ✅ Atualização de dados
- ✅ Remoção de médicos

### 2. Gestão de Agendamentos
- ✅ Criação de consultas
- ✅ Listagem e filtros
- ✅ Atualização de status
- ✅ Cancelamento de consultas

### 3. Gestão de Usuários
- ✅ Registro com verificação de e-mail
- ✅ Login e autenticação JWT
- ✅ Atualização de perfil
- ✅ Recuperação de senha

### 4. Chatbot com IA 🤖
- ✅ Consulta de médicos por especialidade
- ✅ Listagem de agendamentos por data
- ✅ Estatísticas do sistema
- ✅ Consulta de usuários cadastrados
- ✅ Processamento de linguagem natural

---

## ⚙️ Configuração e Instalação

### Pré-requisitos

- **Node.js** (v18 ou superior)
- **npm** ou **yarn**
- Conta **Firebase** (Firestore + Authentication)
- Conta **SendGrid** (para e-mails)
- Conta **Groq** (para chatbot IA - gratuita)

### 1. Clone o Repositório

```bash
git clone https://github.com/EliaasSantanaa/essencial-server.git
cd essencial-server
```

### 2. Instale as Dependências

```bash
npm install
# ou
yarn install
```

### 3. Configure as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Servidor
PORT=3001

# SendGrid (E-mail)
SENDGRID_API_KEY=sua_chave_sendgrid

# Firebase
FIREBASE_SERVICE_ACCOUNT_BASE64=seu_service_account_base64
FIREBASE_API_KEY=sua_api_key
FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
FIREBASE_PROJECT_ID=seu_projeto_id
FIREBASE_STORAGE_BUCKET=seu_projeto.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
FIREBASE_APP_ID=seu_app_id

# URLs
EMAIL_VERIFICATION_URL=http://localhost:3001/auth/verify-email

# AWS Cognito
AWS_REGION=sa-east-1
AWS_USER_POOL_CLIENT_ID=seu_client_id
AWS_USER_POOL_ID=seu_pool_id
AWS_ACCESS_KEY_ID=sua_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key

# Groq (Chatbot IA)
GROQ_API_KEY=sua_chave_groq
```

### 4. Configure o Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Crie um projeto
3. Ative **Firestore Database**
4. Ative **Authentication** (Email/Password)
5. Baixe o `service-account.json`
6. Converta para Base64:
   ```bash
   # Linux/Mac
   base64 -i service-account.json
   
   # Windows (PowerShell)
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("service-account.json"))
   ```
7. Cole o resultado em `FIREBASE_SERVICE_ACCOUNT_BASE64`

### 5. Configure o Groq (Chatbot)

1. Acesse [Groq Console](https://console.groq.com/)
2. Crie uma conta (grátis)
3. Vá em **API Keys**
4. Crie uma nova chave
5. Cole em `GROQ_API_KEY`

### 6. Execute o Projeto

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

A API estará rodando em: `http://localhost:3001`

---

## 📚 Documentação da API

### Endpoints Principais

#### Autenticação
```http
POST /auth/register        # Registrar usuário
POST /auth/login          # Login
POST /auth/verify-email   # Verificar e-mail
```

#### Médicos
```http
GET    /doctors           # Listar médicos
POST   /doctors           # Criar médico
PATCH  /doctors/:id       # Atualizar médico
DELETE /doctors/:id       # Remover médico
```

#### Agendamentos
```http
GET    /appointments      # Listar agendamentos
POST   /appointments      # Criar agendamento
PATCH  /appointments/:id  # Atualizar agendamento
DELETE /appointments/:id  # Cancelar agendamento
```

#### Usuários
```http
GET    /users             # Listar usuários
PATCH  /users/:id         # Atualizar usuário
```

#### Chatbot IA 🤖
```http
POST   /chat              # Enviar mensagem ao chatbot
DELETE /chat/:id          # Limpar histórico da conversa
```

**Exemplo de uso do Chat:**
```json
POST /chat
{
  "message": "Quantos médicos cardiologistas temos?"
}
```

---

## 🤖 Chatbot - Como Usar

O assistente virtual responde perguntas como:

- "Olá, o que você faz?"
- "Quantos médicos temos cadastrados?"
- "Quais especialidades estão disponíveis?"
- "Quantos agendamentos temos hoje?"
- "Me mostre os médicos cardiologistas"
- "Quantos usuários estão cadastrados?"

Veja mais detalhes em: [CHAT_AI_README.md](./CHAT_AI_README.md)

---

## 🧪 Testando a API

### Postman
Importe as collections disponíveis:
- `postman-chat-collection.json` - Testes do chatbot
- Use o arquivo `chat-tests.http` com a extensão REST Client do VSCode

### Exemplos cURL

```bash
# Listar médicos
curl http://localhost:3001/doctors

# Enviar mensagem ao chatbot
curl -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Quantos médicos temos?"}'
```

---

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Módulo principal
├── firebase/               # Configuração Firebase
├── models/                 # Modelos de dados
└── modules/
    ├── appointments/       # Gestão de agendamentos
    ├── auth/              # Autenticação
    ├── chat/              # Chatbot IA
    ├── doctors/           # Gestão de médicos
    ├── email/             # Envio de e-mails
    └── users/             # Gestão de usuários
```

---

## 🎓 Contexto Acadêmico

Este projeto foi desenvolvido como **trabalho integrador** para apresentação na faculdade, contemplando as seguintes disciplinas:

| Disciplina | Aplicação no Projeto |
|-----------|---------------------|
| **Engenharia de Software** | Arquitetura modular, padrões de projeto |
| **Banco de Dados** | Modelagem NoSQL, Firestore |
| **Programação Web** | API RESTful, NestJS, TypeScript |
| **Segurança da Informação** | JWT, Firebase Auth, AWS Cognito |
| **Inteligência Artificial** | Chatbot com Groq/Llama 3.3 |
| **Gestão de Projetos** | Git, documentação, versionamento |

---

## 👥 Equipe

- **Desenvolvedor**: Elias Santana
- **GitHub**: [@EliaasSantanaa](https://github.com/EliaasSantanaa)

---

## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos.

---

## 🔗 Links Úteis

- [Documentação NestJS](https://docs.nestjs.com)
- [Firebase Docs](https://firebase.google.com/docs)
- [Groq Console](https://console.groq.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

<p align="center">
  Desenvolvido com ❤️ para apresentação acadêmica
</p>
