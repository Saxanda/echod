import { Service } from "typedi";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { BadRequestError, UnauthorizedError } from "routing-controllers";

import { UserModel } from "../models/User";
import { RegisterDto, LoginDto } from "../dto/auth.dto";

@Service()
export class AuthService {
    async register(dto: RegisterDto) {
        const existingUser = await UserModel.findOne({
            $or: [{ email: dto.email }, { username: dto.username }],
        });

        if (existingUser) {
            throw new BadRequestError("User already exists");
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const emailVerificationToken = crypto.randomBytes(32).toString("hex");

        const user = await UserModel.create({
            username: dto.username,
            displayName: dto.displayName,
            email: dto.email,
            password: hashedPassword,
            emailVerificationToken,
        });

        return {
            message: "User registered successfully. Please verify your email.",
            user: {
                id: user.id,
                username: user.username,
                displayName: user.displayName,
                email: user.email,
            },
        };
    }

    async login(dto: LoginDto) {
        const user = await UserModel.findOne({ email: dto.email });

        if (!user) {
            throw new UnauthorizedError("Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedError("Invalid email or password");
        }

        const expiresIn = dto.rememberMe ? "30d" : "7d";

        const token = jwt.sign(
            { sub: user.id },
            process.env.JWT_SECRET as string,
            { expiresIn }
        );

        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                displayName: user.displayName,
                email: user.email,
                avatar: user.avatar,
            },
        };
    }

    async verifyEmail(token: string) {
        const user = await UserModel.findOne({ emailVerificationToken: token });

        if (!user) {
            throw new BadRequestError("Invalid verification token");
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;

        await user.save();

        return { message: "Email verified successfully" };
    }

    async forgotPassword(email: string) {
        return { message: `Password reset link sent to ${email}` };
    }

    async resetPassword(token: string, password: string) {
        return { message: "Password reset successfully" };
    }
}