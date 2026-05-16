// models/Follow.ts
import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { User } from "./User";

export class Follow {
    @prop({ ref: () => User, required: true })
    public follower!: Ref<User>;

    @prop({ ref: () => User, required: true })
    public following!: Ref<User>;
}

export const FollowModel = getModelForClass(Follow);
