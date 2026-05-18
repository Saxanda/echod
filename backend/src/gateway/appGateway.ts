import { Service } from "typedi";
import { Server, Socket } from "socket.io";

@Service()
export class AppGateway {
    private server!: Server;

    init(server: Server) {
        this.server = server;

        this.server.on("connection", (client: Socket) => {
            const userId = String(client.handshake.query.userId || "");

            console.log(`Client connected: ${client.id}`);

            if (userId) {
                client.join(`user:${userId}`);
                client.join(`feed:${userId}`);

                console.log(`User ${userId} joined rooms`);
            }

            client.on("join:feed", (id: string) => {
                client.join(`feed:${id}`);
            });

            client.on("disconnect", () => {
                console.log(`Client disconnected: ${client.id}`);
            });
        });
    }

    notifyFollowers(followerIds: string[], post: any) {
        followerIds.forEach((id) => {
            this.server.to(`feed:${id}`).emit("new:post", post);
        });
    }

    sendToUser(userId: string, event: string, payload: any) {
        this.server.to(`user:${userId}`).emit(event, payload);
    }
}