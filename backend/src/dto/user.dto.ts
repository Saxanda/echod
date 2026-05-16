// src/dto/user.dto.ts
import { IsString, IsOptional, MinLength, MaxLength } from "class-validator";

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    displayName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(160)
    bio?: string;

    @IsOptional()
    @IsString()
    avatar?: string;

    @IsOptional()
    @IsString()
    headerImage?: string;
}