// gateway/appGateway.ts
import { Service } from "typedi";
import { Server, Socket } from "socket.io";

@Service()
export class AppGateway {
    private server: Server;

    init(server: Server) {
        this.server = server;

        this.server.on("connection", (client: Socket) => {
            console.log(`Client connected: ${client.id}`);

            client.on("join:feed", (userId: string) => {
                client.join(`feed:${userId}`);
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
}