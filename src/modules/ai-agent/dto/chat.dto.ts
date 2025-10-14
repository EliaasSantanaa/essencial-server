import { IsNotEmpty, IsString } from "class-validator";

export class ChatDto {

    @IsString()
    @IsNotEmpty()
    prompt: string;
}