import { Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, SchemaType, FunctionDeclaration } from '@google/generative-ai';
import { AuthService } from '../auth/auth.service';
import { SignUpDto } from '../auth/dto/sign-up.dto';

const tools = [
  {
    name: 'createUser',
    description: 'Cria um novo usuário no sistema com todos os seus dados.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        name: { type: SchemaType.STRING, description: 'O nome completo do usuário.' },
        email: { type: SchemaType.STRING, description: 'O endereço de e-mail do usuário.' },
        password: { type: SchemaType.STRING, description: 'A senha escolhida pelo usuário. Deve ter no mínimo 6 caracteres.' },
        birthday: { type: SchemaType.STRING, description: 'A data de nascimento do usuário. Converta para o formato AAAA-MM-DD.' },
        height: { type: SchemaType.NUMBER, description: 'A altura do usuário em metros (ex: 1.80). Extraia apenas o número do texto.' },
        weight: { type: SchemaType.NUMBER, description: 'O peso do usuário em quilogramas (ex: 86). Extraia apenas o número do texto.' },
        authorized: { type: SchemaType.BOOLEAN, description: 'Deve ser `true` se o usuário mencionar que concorda ou aceita os termos.' },
      },
      // required intentionally omitted so the model can call the function with partial data;
      // the service will validate and respond with missingFields if needed
    },
  },
];

@Injectable()
export class AiAgentService implements OnModuleInit {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private modelName = 'gemini-pro';

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    // a inicialização do genAI e do model será feita em onModuleInit
  }

  async onModuleInit() {
    const geminiApiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.warn('AiAgentService: GEMINI_API_KEY não encontrada; GenAI não será inicializado.');
      // fallback: mock to allow app run
      this.model = {
        startChat: () => ({
          sendMessage: async (_input: any) => ({
            response: { functionCalls: () => [], text: () => 'GenAI não configurado (sem GEMINI_API_KEY).' },
          }),
        }),
      } as any;
      return;
    }

    // inicializa cliente
    this.genAI = new GoogleGenerativeAI(geminiApiKey);

    // se tiver GEMINI_MODEL_NAME no env, tenta usar direto
    const envModel = this.configService.get<string>('GEMINI_MODEL_NAME');
    const preferred = envModel ? [envModel] : ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-flash-latest'];

    // tenta listar modelos e escolher um que suporte generateContent
    try {
      const list = await this.listModels();
      const models = list?.models || list?.items || list || [];

      // escolha preferencial
      let chosen: string | null = null;
      for (const p of preferred) {
        const found = models.find((m: any) => m.name?.endsWith(`/${p}`) || m.name === `models/${p}` || m.name === p);
        if (found && found.supportedGenerationMethods?.includes('generateContent')) {
          chosen = found.name.replace(/^models\//, '');
          break;
        }
      }

      if (!chosen) {
        // pegue o primeiro que suporte generateContent
        const anyModel = models.find((m: any) => m.supportedGenerationMethods?.includes('generateContent'));
        if (anyModel) chosen = anyModel.name.replace(/^models\//, '');
      }

      if (!chosen) {
        console.warn('AiAgentService: nenhum modelo com generateContent encontrado; usando fallback mock.');
        this.model = {
          startChat: () => ({
            sendMessage: async (_input: any) => ({
              response: { functionCalls: () => [], text: () => 'Nenhum modelo de geração disponível na conta.' },
            }),
          }),
        } as any;
        return;
      }

      this.modelName = chosen;
      console.log(`AiAgentService: escolhendo modelo ${this.modelName}`);

      this.model = this.genAI.getGenerativeModel({
        model: this.modelName,
        tools: [{ functionDeclarations: (tools as unknown) as FunctionDeclaration[] }],
        systemInstruction: `Você é um assistente virtual para a Clínica EssencialDev.\nSeu objetivo é ajudar os usuários a se cadastrarem.`,
      });
      console.log(`AiAgentService: inicializado com modelo ${this.modelName}`);
    } catch (err) {
      console.error('AiAgentService: falha ao selecionar modelo automaticamente:', err?.message || err);
      // fallback mock
      this.model = {
        startChat: () => ({
          sendMessage: async (_input: any) => ({
            response: { functionCalls: () => [], text: () => 'Erro ao inicializar GenAI.' },
          }),
        }),
      } as any;
    }

  }

    async run(prompt: string): Promise<{ response: string }> {
    const chat = this.model.startChat();

    let result1: any;
    try {
      result1 = await chat.sendMessage(prompt);
    } catch (err: any) {
      // Se o modelo não for encontrado (404), tentar modelos alternativos antes de falhar
      if (err?.status === 404) {
        console.warn(`AiAgentService: modelo ${this.modelName} não disponível para generateContent. Tentando fallbacks...`);
        const fallbackModels = [
          'gemini-1.5-flash-latest',
          'gemini-1.5-pro',
          'gemini-1.5',
          'chat-bison-001',
          'text-bison-001',
        ];

        let succeeded = false;
        for (const alt of fallbackModels) {
          if (alt === this.modelName) continue;
          try {
            console.log(`AiAgentService: tentando modelo alternativo ${alt}...`);
            this.model = this.genAI.getGenerativeModel({
              model: alt,
              tools: [{ functionDeclarations: (tools as unknown) as FunctionDeclaration[] }],
              systemInstruction: `Você é um assistente virtual para a Clínica EssencialDev.\nSeu objetivo é ajudar os usuários a se cadastrarem.`,
            });
            const altChat = this.model.startChat();
            result1 = await altChat.sendMessage(prompt);
            this.modelName = alt; // atualiza para o modelo que funcionou
            console.log(`AiAgentService: modelo alternativo ${alt} funcionou.`);
            succeeded = true;
            break;
          } catch (e) {
            console.warn(`AiAgentService: modelo ${alt} falhou:`, e?.message || e);
            continue;
          }
        }

        if (!succeeded) {
          // rethrow o erro original se nenhum fallback funcionou
          throw err;
        }
      } else {
        throw err;
      }
    }
    const response1 = result1.response;
    const call = response1.functionCalls()?.[0];

    if (!call) {
      return { response: response1.text() };
    }
    
    const apiResponse = await this.executeFunctionCall(call);
    const result2 = await chat.sendMessage([apiResponse]);

    return { response: result2.response.text() };
  }

  // Método de diagnóstico: listar modelos disponíveis pela API (temp)
  async listModels(): Promise<any> {
    // 1) tentar via SDK (compatível com diferentes versões)
    try {
      const sdk = this.genAI as any;
      let res: any = undefined;

      if (typeof sdk.listModels === 'function') {
        res = await sdk.listModels();
      } else if (typeof sdk.list === 'function') {
        res = await sdk.list();
      }

      if (res) {
        // normalizar estrutura de retorno quando possível
        if (res.models) return res;
        return res;
      }
    } catch (error) {
      console.warn('Erro ao listar modelos via SDK:', error?.message || error);
    }

    // 2) fallback: usar REST diretamente com axios e API key (query param)
    try {
      const apiKey = this.configService.get<string>('GEMINI_API_KEY');
      if (!apiKey) throw new Error('GEMINI_API_KEY ausente');
      const axios = require('axios');
      const url = 'https://generativelanguage.googleapis.com/v1beta/models';
      const response = await axios.get(url, { params: { key: apiKey } });
      // response.data deve conter modelos; normalizar
      if (response?.data) return response.data;
      throw new Error('Resposta vazia do endpoint de modelos');
    } catch (restErr) {
      console.error('Erro no fallback REST para listar modelos:', restErr?.message || restErr);
      throw new InternalServerErrorException('Falha ao listar modelos do GenAI (SDK e REST).');
    }
  }

  
  private async executeFunctionCall(call: any): Promise<any> {
    const { name, args } = call;
    let functionResult: any;

    switch (name) {
      case 'createUser':
        try {
          // Validação prévia dos argumentos fornecidos pela função
          const required = ['name', 'email', 'password', 'birthday', 'height', 'weight', 'authorized'];
          const missing: string[] = [];
          const typeErrors: string[] = [];

          for (const key of required) {
            if (args[key] === undefined || args[key] === null || args[key] === '') {
              missing.push(key);
            }
          }

          // checagens de tipo simples
          if (args.height !== undefined && typeof args.height !== 'number') typeErrors.push('height must be a number');
          if (args.weight !== undefined && typeof args.weight !== 'number') typeErrors.push('weight must be a number');
          if (args.authorized !== undefined && typeof args.authorized !== 'boolean') typeErrors.push('authorized must be a boolean');

          if (missing.length > 0 || typeErrors.length > 0) {
            // Retorna informação estruturada para o modelo saber pedir os campos faltantes
            functionResult = { missingFields: missing, typeErrors };
          } else {
            const signUpDto: Partial<SignUpDto> = {
              name: args.name,
              email: args.email,
              password: args.password,
              birthday: args.birthday,
              height: args.height,
              weight: args.weight,
              authorized: args.authorized,
            };
            functionResult = await this.authService.signUp(signUpDto as SignUpDto);
          }
        } catch (error) {
          functionResult = { error: error.message };
        }
        break;

      default:
        throw new InternalServerErrorException(`Função desconhecida: ${name}`);
    }

    return {
      functionResponse: {
        name,
        response: {
          content: functionResult,
        },
      },
    };
  }
}
