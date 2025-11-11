import { PartialType } from "@nestjs/swagger";
import { AdminCreateUserDto } from "src/modules/auth/dto/auth.dto";

export class UpdateUserDto extends PartialType(AdminCreateUserDto) {}