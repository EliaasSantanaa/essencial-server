import { Body, Controller, HttpStatus, Post, Get } from '@nestjs/common';
import { AiAgentService } from './ai-agent.service';
import { ChatDto } from './dto/chat.dto';

@Controller('ai-agent')
export class AiAgentController {
    constructor(private readonly aiAgentService: AiAgentService) {}

    @Post('chat')
    async chat(@Body() chatDto: ChatDto) {
        const userPrompt = chatDto.prompt;
        const message = await this.aiAgentService.run(userPrompt);
        return {
            statusCode: HttpStatus.OK,
            message: 'Resposta gerada com sucesso',
            data: message,
        }
    }

    @Get('models')
    async models() {
        const list = await this.aiAgentService.listModels();
        return {
            statusCode: HttpStatus.OK,
            message: 'Modelos listados com sucesso',
            data: list,
        }
    }
}
