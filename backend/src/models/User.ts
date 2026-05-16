import { getModelForClass, prop } from "@typegoose/typegoose";

export class User {
    @prop({ type: () => String, required: true, unique: true })
    public username!: string;

    @prop({ type: () => String, required: true })
    public displayName!: string;

    @prop({ type: () => String, required: true, unique: true })
    public email!: string;

    @prop({ type: () => String, required: true })
    public password!: string;

    @prop({ type: () => String, default: "" })
    public avatar!: string;

    @prop({ type: () => String, default: "" })
    public headerImage!: string;

    @prop({ type: () => String, default: "" })
    public bio!: string;

    @prop({ type: () => Boolean, default: false })
    public isEmailVerified!: boolean;

    @prop({ type: () => String })
    public emailVerificationToken?: string;

    @prop({ type: () => String })
    public passwordResetToken?: string;

    @prop({ type: () => Date })
    public passwordResetExpires?: Date;

    @prop({ type: () => String })
    public googleId?: string;

    @prop({ type: () => Date, default: Date.now })
    public createdAt!: Date;
}

export const UserModel = getModelForClass(User);