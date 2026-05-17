// backend/src/services/notificationService.ts
import {Service} from "typedi";
import {Types} from "mongoose";
import {NotificationModel, NotificationType} from "../models/Notification";

@Service()
export class NotificationService {
    async createNewPostNotification(
        recipientId: string,
        senderId: string,
        postId: string,
    ) {
        return NotificationModel.create({
            recipient: new Types.ObjectId(recipientId),
            sender: new Types.ObjectId(senderId),
            post: new Types.ObjectId(postId),
            type: NotificationType.NEW_POST,
            text: "New post from someone you follow",
        });
    }

    async createNewMessageNotification(
        recipientId: string,
        senderId: string,
    ) {
        return NotificationModel.create({
            recipient: new Types.ObjectId(recipientId),
            sender: new Types.ObjectId(senderId),
            chatUserId: senderId,
            type: NotificationType.NEW_MESSAGE,
            text: "New private message",
        });
    }

    async createNewFollowerNotification(
        recipientId: string,
        senderId: string,
    ) {
        return NotificationModel.create({
            recipient: new Types.ObjectId(recipientId),
            sender: new Types.ObjectId(senderId),
            type: NotificationType.NEW_FOLLOWER,
            text: "started following you",
        });
    }

    async getMyNotifications(userId: string) {
        const notifications = await NotificationModel.find({
            recipient: new Types.ObjectId(userId),
        })
            .sort({createdAt: -1})
            .populate("sender", "username displayName avatar")
            .lean();

        return {
            notifications: notifications.map((n: any) => ({
                id: String(n._id),
                type: n.type,
                text: n.text,
                read: n.read,
                createdAt: n.createdAt,
                sender: n.sender,
                postId: n.post ? String(n.post) : null,
                chatUserId: n.chatUserId || null,
            })),
        };
    }

    async markAsRead(userId: string, notificationId: string) {
        await NotificationModel.updateOne(
            {
                _id: new Types.ObjectId(notificationId),
                recipient: new Types.ObjectId(userId),
            },
            {$set: {read: true}},
        );

        return {success: true};
    }
}