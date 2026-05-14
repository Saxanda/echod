// src/dto/auth.dto.ts
import {IsEmail, IsString, Matches, MaxLength, MinLength} from "class-validator";

export class RegisterDto {
    @IsString()
    @MinLength(3)
    @MaxLength(20)
    @Matches(/^[a-zA-Z0-9_]+$/, {
        message: "Username can only contain letters, numbers, underscores",
    })
    username!: string;

    @IsString()
    @MinLength(2)
    displayName!: string;

    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(6)
    password!: string;
}

export class LoginDto {
    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(6)
    password!: string;

    rememberMe?: boolean;
}

export class ForgotPasswordDto {
    @IsEmail()
    email!: string;
}