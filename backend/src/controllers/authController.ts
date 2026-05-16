// backend/src/controllers/authController.ts
import {
    Body,
    Get,
    HttpCode,
    JsonController,
    Post,
    QueryParam,
    Req,
    UnauthorizedError,
} from "routing-controllers";
import { Service, Container } from "typedi";
import { Request } from "express";
import { AuthService } from "../services/authService";
import { ForgotPasswordDto, LoginDto, RegisterDto } from "../dto/auth.dto";

@JsonController("/auth")
@Service()
export class AuthController {
    private authService = Container.get(AuthService);

    @Post("/register")
    @HttpCode(201)
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post("/login")
    @HttpCode(200)
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Get("/verify")
    verifyEmail(@QueryParam("token") token: string) {
        return this.authService.verifyEmail(token);
    }

    @Get("/me")
    me(@Req() req: Request & { user?: any }) {
        if (!req.user) throw new UnauthorizedError();
        return req.user;
    }

    @Post("/forgot-password")
    forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.forgotPassword(dto.email);
    }

    @Post("/reset-password")
    resetPassword(@Body() body: { token: string; password: string }) {
        return this.authService.resetPassword(body.token, body.password);
    }
}