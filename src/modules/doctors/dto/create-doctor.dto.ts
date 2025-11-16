import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateDoctorDto {
    @ApiProperty({ description: 'Nome completo do médico', example: 'Dr. João Da Silva' })
    @IsString({message: 'name deve ser string'})
    @IsNotEmpty({message: 'name não pode ser vazio'})
    name: string;

    @ApiProperty({ description: 'Especialidade do médico', example: 'Cardiologia' })
    @IsString({message: 'specialty deve ser string'})
    @IsNotEmpty({message: 'specialty não pode ser vazio'})
    specialty: string;

    @ApiProperty({ description: 'CRM do médico', example: '123456' })
    @IsString({message: 'crm deve ser string'})
    @IsNotEmpty({message: 'crm não pode ser vazio'})
    crm: string;
}

export class CreateDoctorsBulkDto {
    @IsArray({ message: 'doctors deve ser um array' })
    @ValidateNested({ each: true })
    @Type(() => CreateDoctorDto)
    doctors: CreateDoctorDto[];
}
