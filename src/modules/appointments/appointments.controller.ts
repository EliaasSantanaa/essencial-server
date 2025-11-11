import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Controller('appointments')
export class AppointmentsController {
    constructor(private readonly appointmentsService: AppointmentsService) {}

    @Get()
    findAll() {
        const appointments = this.appointmentsService.findAll();
        return appointments;
    }

    @Post()
    async create(@Body() data: CreateAppointmentDto) {
        const newAppointment = await this.appointmentsService.create(data);
        return newAppointment;
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() data: UpdateAppointmentDto) {
        const updatedAppointment = await this.appointmentsService.update(id, data);
        return updatedAppointment;
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id') id: string) {
       await this.appointmentsService.delete(id);
    }
}
