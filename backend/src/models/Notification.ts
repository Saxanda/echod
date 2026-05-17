// models/Notification.ts
import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { User } from "./User";
import { Post } from "./Post";

export enum NotificationType {
    NEW_POST = "NEW_POST",
    NEW_MESSAGE = "NEW_MESSAGE",
    NEW_FOLLOWER = "NEW_FOLLOWER",
}

export class Notification {
    @prop({
        ref: () => User,
        required: true,
    })
    recipient!: Ref<User>;

    @prop({
        ref: () => User,
        required: true,
    })
    sender!: Ref<User>;

    @prop({
        type: () => String,
        enum: Object.values(NotificationType),
        required: true,
    })
    type!: NotificationType;

    @prop({
        required: true,
    })
    text!: string;

    @prop({
        ref: () => Post,
    })
    post?: Ref<Post>;

    @prop()
    chatUserId?: string;

    @prop({
        default: false,
    })
    read!: boolean;

    @prop({
        default: Date.now,
    })
    createdAt!: Date;
}

export const NotificationModel =
    getModelForClass(Notification);