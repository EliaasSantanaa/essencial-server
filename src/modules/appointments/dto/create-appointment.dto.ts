import { IsDate, IsNotEmpty, IsString, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAppointmentDto {
  @Type(() => Date)
  @IsDate({ message: 'Data no formato inválido deve ser YYYY-MM-DD.' })
  @IsNotEmpty({ message: 'date é obrigatório.' })
  date: Date;

  @IsString({ message: 'hour deve ser uma string.' })
  @IsNotEmpty({ message: 'hour é obrigatório.' })
  hour: string;

  @IsString({ message: 'specialist deve ser uma string.' })
  @IsNotEmpty({ message: 'specialist é obrigatório.' })
  specialist: string;
}
