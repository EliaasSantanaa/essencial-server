import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator";

export class CreateDoctorDto {
    @IsString({message: 'name deve ser string'})
    @IsNotEmpty({message: 'name não pode ser vazio'})
    name: string;

    @IsString({message: 'specialty deve ser string'})
    @IsNotEmpty({message: 'specialty não pode ser vazio'})
    specialty: string;

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
