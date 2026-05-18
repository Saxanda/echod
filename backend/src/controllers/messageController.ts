// backend/src/controllers/messageController.ts
import { Body, Get, JsonController, Param, Post } from "routing-controllers";
import { Authorized } from "routing-controllers";
import { Service, Container } from "typedi";
import { MessageService } from "../services/messageService";
import { CurrentUser } from "../decorators/currentUser";
import { User } from "../models/User";
@Authorized()
@JsonController("/messages")
@Service()
export class MessageController {
    private messageService = Container.get(MessageService);
    @Get("")
    getConversationsRoot(@CurrentUser() user: User) {
        return this.messageService.getConversations(
            String((user as any)._id)
        );
    }
    @Get("/")
    getConversations(@CurrentUser() user: User) {
        return this.messageService.getConversations(
            String((user as any)._id)
        );
    }

    @Get("/conversations")
    getConversationsOld(@CurrentUser() user: User) {
        return this.messageService.getConversations(
            String((user as any)._id)
        );
    }

    @Get("/:userId")
    getConversation(
        @CurrentUser() user: User,
        @Param("userId") userId: string
    ) {
        return this.messageService.getConversation(
            String((user as any)._id),
            userId
        );
    }

    @Post("/:userId")
    sendMessage(
        @CurrentUser() user: User,
        @Param("userId") userId: string,
        @Body() body: { text: string }
    ) {
        return this.messageService.sendMessage(
            String((user as any)._id),
            userId,
            body.text
        );
    }
}