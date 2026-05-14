// src/services/authService.ts
import {Service} from "typedi";
import {UserModel} from "../models/User";
import {LoginDto, RegisterDto} from "../dto/auth.dto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

@Service()
export class AuthService {
    async register(dto: RegisterDto) {
        const existing = await UserModel.findOne({
            $or: [{email: dto.email}, {username: dto.username}],
        });
        if (existing) throw new Error("Email or username already taken");

        const hashed = await bcrypt.hash(dto.password, 10);
        const verifyToken = crypto.randomBytes(32).toString("hex");

        const user = await UserModel.create({
            ...dto,
            password: hashed,
            emailVerificationToken: verifyToken,
        });

        // TODO: await mailService.sendVerification(user.email, verifyToken);
        console.log(`Verify token for ${user.email}: ${verifyToken}`);

        return {message: "Registered. Check your email to verify."};
    }

    async login(dto: LoginDto) {
        const user = await UserModel.findOne({email: dto.email});
        if (!user) throw new Error("Invalid credentials");

        const valid = await bcrypt.compare(dto.password, user.password);
        if (!valid) throw new Error("Invalid credentials");

        // ✅ перевірку верифікації поки не налаштований email
        // if (!user.isEmailVerified) throw new Error("Please verify your email first");

        const token = jwt.sign(
            {sub: user._id, username: user.username},
            process.env.JWT_SECRET!,
            {expiresIn: "7d"},
        );

        // ✅ змінено access_token → token щоб збігалося з фронтендом
        return {
            token,
            user: {
                id: user._id,
                username: user.username,
                displayName: user.displayName,
                email: user.email,
                avatar: user.avatar,
            }
        };
    }

    async verifyEmail(token: string) {
        const user = await UserModel.findOne({emailVerificationToken: token});
        if (!user) throw new Error("Invalid or expired token");

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        await user.save();

        return {message: "Email verified successfully!"};
    }

    async forgotPassword(email: string) {
        const user = await UserModel.findOne({email});
        // Always return success to avoid email enumeration
        if (!user) return {message: "If that email exists, a reset link was sent."};

        const resetToken = crypto.randomBytes(32).toString("hex");
        user.passwordResetToken = resetToken;
        await user.save();

        // TODO: await mailService.sendPasswordReset(email, resetToken);
        console.log(`Reset token for ${email}: ${resetToken}`);

        return {message: "If that email exists, a reset link was sent."};
    }

    async resetPassword(token: string, newPassword: string) {
        const user = await UserModel.findOne({passwordResetToken: token});
        if (!user) throw new Error("Invalid or expired token");

        user.password = await bcrypt.hash(newPassword, 10);
        user.passwordResetToken = undefined;
        await user.save();

        return {message: "Password reset successfully."};
    }
}