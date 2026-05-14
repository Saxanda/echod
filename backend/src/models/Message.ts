// models/Message.ts
import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { User } from "./User";

export class Message {
    @prop({ ref: () => User, required: true })
    public sender!: Ref<User>;

    @prop({ ref: () => User, required: true })
    public receiver!: Ref<User>;

    @prop({ required: true })
    public text!: string;

    @prop({ default: false })
    public isRead!: boolean;

    @prop({ default: Date.now })
    public createdAt!: Date;
}

export const MessageModel = getModelForClass(Message);