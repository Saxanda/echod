// models/Notification.ts
import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { User } from "./User";

export enum NotificationType {
    NEW_POST = "NEW_POST",
    NEW_MESSAGE = "NEW_MESSAGE",
    NEW_FOLLOWER = "NEW_FOLLOWER",
}

export class Notification {
    @prop({ ref: () => User, required: true })
    public recipient!: Ref<User>;

    @prop({ ref: () => User, required: true })
    public sender!: Ref<User>;

    @prop({ required: true, enum: NotificationType })
    public type!: NotificationType;

    @prop({ default: false })
    public isRead!: boolean;

    // e.g. postId for NEW_POST, messageId for NEW_MESSAGE
    @prop()
    public refId?: string;

    @prop({ default: Date.now })
    public createdAt!: Date;
}

export const NotificationModel = getModelForClass(Notification);