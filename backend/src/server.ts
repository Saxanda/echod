// backend/src/server.ts
import "reflect-metadata";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { Container } from "typedi";
import app from "./app";
import connectDB from "./config/db";
import { AppGateway } from "./gateway/appGateway";

dotenv.config();
connectDB();

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: process.env.CLIENT_URL, credentials: true } });

Container.get(AppGateway).init(io);

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});