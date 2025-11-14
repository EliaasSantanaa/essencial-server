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

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Post()
  async create(@Body() dto: CreateDoctorDto) {
    const newDoctor = await this.doctorsService.create(dto);
    return newDoctor;
  }

  @Get()
  async findAll() {
    const doctors = await this.doctorsService.findAll();
    return doctors;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDoctorDto: UpdateDoctorDto) {
    const updateDoctor = await this.doctorsService.update(id, updateDoctorDto);
    return updateDoctor;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.doctorsService.remove(id);
  }
}
