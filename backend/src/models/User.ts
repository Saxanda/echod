import {
    getModelForClass,
    prop,
} from "@typegoose/typegoose";

export class User {
    @prop({
        required: true,
        unique: true,
    })
    public username!: string;

    @prop({
        required: true,
    })
    public displayName!: string;

    @prop({
        required: true,
        unique: true,
    })
    public email!: string;

    @prop({
        required: true,
    })
    public password!: string;

    @prop({
        default: "",
    })
    public avatar!: string;

    @prop({
        default: "",
    })
    public headerImage!: string;

    @prop({
        default: "",
    })
    public bio!: string;

    @prop({
        default: false,
    })
    public isEmailVerified!: boolean;

    @prop()
    public emailVerificationToken?: string;

    @prop()
    public passwordResetToken?: string;

    @prop()
    public googleId?: string;

    @prop({ default: Date.now })
    public createdAt!: Date;
}

export const UserModel =
    getModelForClass(User);