// src/middleware/authMiddleware.ts
import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";
import { Request, Response, NextFunction } from "express"; //
import { Service } from "typedi";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/User";

@Middleware({ type: "before" })
@Service()
export class AuthMiddleware implements ExpressMiddlewareInterface {
    async use(req: Request, res: Response, next: NextFunction) {
        const token =
            req.cookies?.token ||
            req.headers.authorization?.split(" ")[1];

        if (!token) return next();

        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
                sub: string;
            };
            req.user = await UserModel.findById(payload.sub).lean(); // ← req
        } catch (err) {
            console.log("AUTH MIDDLEWARE - jwt error:", err);
        }

        next();
    }
}