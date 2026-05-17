// src/app.ts
import "reflect-metadata";
import express from "express";
import cors from "cors";
import { useExpressServer, useContainer } from "routing-controllers";
import { Container } from "typedi";
import cookieParser from "cookie-parser";
import { AuthController } from "./controllers/authController";
import { AuthMiddleware } from "./middleware/authMiddleware";
import { PostController } from "./controllers/postController";
import { UserController } from "./controllers/userController";
import { NotificationController } from "./controllers/notificationController";

useContainer(Container);

const app = express();

// ✅ CORS
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(cookieParser());
// ✅
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

useExpressServer(app, {
    routePrefix: "/api",
    controllers: [AuthController, PostController, UserController, NotificationController],
    middlewares: [AuthMiddleware],
    defaultErrorHandler: true,
    validation: true,
    currentUserChecker: (action) => action.request.user,
});

export default app;