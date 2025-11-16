import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto, CreateDoctorsBulkDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('Doctors')
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra um novo médico' })
  @ApiBody({ type: CreateDoctorDto })
  @ApiResponse({ status: 201, description: 'Médico cadastrado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  async create(@Body() dto: CreateDoctorDto) {
    const newDoctor = await this.doctorsService.create(dto);
    return newDoctor;
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os médicos' })
  @ApiResponse({ status: 200, description: 'Lista de médicos retornada com sucesso.' })
  async findAll() {
    const doctors = await this.doctorsService.findAll();
    return doctors;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza os dados de um médico pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do médico', example: '607f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Médico atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Médico não encontrado.' })
  async update(@Param('id') id: string, @Body() updateDoctorDto: UpdateDoctorDto) {
    const updateDoctor = await this.doctorsService.update(id, updateDoctorDto);
    return updateDoctor;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um médico pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do médico', example: '607f1f77bcf86cd799439011' })
  @ApiResponse({ status: 204, description: 'Médico removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Médico não encontrado.' })
  async remove(@Param('id') id: string) {
    await this.doctorsService.remove(id);
  }
}
