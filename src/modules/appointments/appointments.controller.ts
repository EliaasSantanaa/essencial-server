import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../guards/auth.guard';

@ApiTags('Appointments')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('appointments')
export class AppointmentsController {
    constructor(private readonly appointmentsService: AppointmentsService) {}

    @Get()
    @ApiOperation({ summary: 'Retorna todas as consultas agendadas' })
    @ApiResponse({ status: 200, description: 'Lista de consultas retornada com sucesso.' })
    findAll() {
        const appointments = this.appointmentsService.findAll();
        return appointments;
    }

    @Post()
    @ApiOperation({ summary: 'Cria uma nova consulta agendada' })
    @ApiResponse({ status: 201, description: 'Agendamento criado com sucesso.' })
    @ApiResponse({ status: 400, description: 'Erro de validação nos dados enviados.' })
    async create(@Body() data: CreateAppointmentDto) {
        const newAppointment = await this.appointmentsService.create(data);
        return newAppointment;
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualiza um agendamendo existente' })
    @ApiParam({ name: 'id', description: 'ID do agendamento a ser atualizado' })
    @ApiResponse({ status: 200, description: 'Agendamento atualizado com sucesso.' })
    @ApiResponse({ status: 404, description: 'Agendamento não encontrado.' })
    async update(@Param('id') id: string, @Body() data: UpdateAppointmentDto) {
        const updatedAppointment = await this.appointmentsService.update(id, data);
        return updatedAppointment;
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Deleta um agendamento existente' })
    @ApiParam({ name: 'id', description: 'ID do agendamento a ser deletado' })
    @ApiResponse({ status: 204, description: 'Agendamento deletado com sucesso.' })
    @ApiResponse({ status: 404, description: 'Agendamento não encontrado.' })
    async delete(@Param('id') id: string) {
       await this.appointmentsService.delete(id);
    }
}
