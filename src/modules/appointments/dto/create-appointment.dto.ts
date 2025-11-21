import { IsDate, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'Data do agendamento no formato YYYY-MM-DD',
    example: '9999-99-99',
  })
  @Type(() => Date)
  @IsDate({ message: 'Data no formato inválido deve ser YYYY-MM-DD.' })
  @IsNotEmpty({ message: 'date é obrigatório.' })
  date: Date;

  @ApiProperty({
    description: 'Hora do agendamento no formato HH:MM',
    example: '14:30',
  })
  @IsString({ message: 'hour deve ser uma string.' })
  @IsNotEmpty({ message: 'hour é obrigatório.' })
  hour: string;

  @ApiProperty({
    description: 'Especialista da consulta',
    example: 'Dr. João da Silva',
  })
  @IsString({ message: 'specialist deve ser uma string.' })
  @IsNotEmpty({ message: 'specialist é obrigatório.' })
  specialist: string;

  @IsString({ message: 'patient_id deve ser uma string.' })
  @IsNotEmpty({ message: 'patient_id é obrigatório.' })
  patient_id: string;

  @ApiProperty({
    description: 'Email do paciente',
    example: 'paciente@example.com',
    required: false,
  })
  @IsString({ message: 'patientEmail deve ser uma string.' })
  @IsOptional({ message: 'patientEmail é opcional.' })
  patientEmail?: string;

  @ApiProperty({
    description: 'Nome do paciente',
    example: 'Maria Oliveira',
    required: false,
  })
  @IsString({ message: 'patientName deve ser uma string.' })
  @IsOptional({ message: 'patientName é opcional.' })
  patientName?: string;
}
