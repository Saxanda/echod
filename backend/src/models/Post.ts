// models/Post.ts
import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { User } from "./User";

export class Post {
    @prop({ required: true, maxlength: 280 })
    public text!: string;

    @prop({ default: "" })
    public image!: string;

    @prop({ ref: () => User, required: true })
    public author!: Ref<User>;

    @prop({ ref: () => User, default: [] })
    public likes!: Ref<User>[];

    @prop({ default: Date.now })
    public createdAt!: Date;
}

export const PostModel = getModelForClass(Post);