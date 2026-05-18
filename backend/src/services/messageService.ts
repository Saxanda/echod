import { Container, Service } from "typedi";
import { Types } from "mongoose";

import { MessageModel } from "../models/Message";
import { FollowModel } from "../models/Follow";
import { NotificationService } from "./notificationService";
import { AppGateway } from "../gateway/appGateway";

@Service()
export class MessageService {
    private notificationService = Container.get(NotificationService);
    private gateway = Container.get(AppGateway);

    private mapMessage(message: any) {
        return {
            id: String(message._id),
            text: message.text,
            createdAt: message.createdAt,
            isRead: message.isRead,
            sender: message.sender,
            receiver: message.receiver,
            senderId: String(message.sender?._id || message.sender),
            receiverId: String(message.receiver?._id || message.receiver),
        };
    }

    async sendMessage(senderId: string, receiverId: string, text: string) {
        const follows = await FollowModel.exists({
            $or: [
                {
                    follower: new Types.ObjectId(senderId),
                    following: new Types.ObjectId(receiverId),
                },
                {
                    follower: new Types.ObjectId(receiverId),
                    following: new Types.ObjectId(senderId),
                },
            ],
        });

        if (!follows) {
            throw new Error(
                "You can only message users when one of you follows the other",
            );
        }

        const message = await MessageModel.create({
            sender: new Types.ObjectId(senderId),
            receiver: new Types.ObjectId(receiverId),
            text,
        });

        const populated = await MessageModel.findById(message._id)
            .populate("sender", "username displayName avatar")
            .populate("receiver", "username displayName avatar")
            .lean();

        const mappedMessage = this.mapMessage(populated);

        await this.notificationService.createNewMessageNotification(
            receiverId,
            senderId,
        );

        this.gateway.sendToUser(receiverId, "new_message", mappedMessage);
        this.gateway.sendToUser(senderId, "new_message", mappedMessage);

        return mappedMessage;
    }

    async getConversations(userId: string) {
        const messages = await MessageModel.find({
            $or: [
                { sender: new Types.ObjectId(userId) },
                { receiver: new Types.ObjectId(userId) },
            ],
        })
            .sort({ createdAt: -1 })
            .populate("sender", "username displayName avatar")
            .populate("receiver", "username displayName avatar")
            .lean();

        const conversationsMap = new Map();

        for (const msg of messages as any[]) {
            const senderId = String(msg.sender._id);
            const partner = senderId === userId ? msg.receiver : msg.sender;
            const partnerId = String(partner._id);

            if (!conversationsMap.has(partnerId)) {
                conversationsMap.set(partnerId, {
                    id: partnerId,
                    partner: {
                        id: partnerId,
                        username: partner.username,
                        displayName: partner.displayName,
                        avatar: partner.avatar,
                    },
                    lastMessage: {
                        id: String(msg._id),
                        text: msg.text,
                        createdAt: msg.createdAt,
                    },
                });
            }
        }

        return {
            conversations: Array.from(conversationsMap.values()),
        };
    }

    async getConversation(currentUserId: string, otherUserId: string) {
        const messages = await MessageModel.find({
            $or: [
                {
                    sender: new Types.ObjectId(currentUserId),
                    receiver: new Types.ObjectId(otherUserId),
                },
                {
                    sender: new Types.ObjectId(otherUserId),
                    receiver: new Types.ObjectId(currentUserId),
                },
            ],
        })
            .sort({ createdAt: 1 })
            .populate("sender", "username displayName avatar")
            .populate("receiver", "username displayName avatar")
            .lean();

        return messages.map((msg) => this.mapMessage(msg));
    }
}