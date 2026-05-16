import { FollowModel } from "../models/Follow";
import { Types } from "mongoose";

export class FollowService {
    async toggle(followerId: string, followingId: string) {
        if (followerId === followingId) throw new Error("Cannot follow yourself");

        const existing = await FollowModel.findOne({
            follower: new Types.ObjectId(followerId),
            following: new Types.ObjectId(followingId),
        });

        if (existing) {
            await existing.deleteOne();
            return { following: false };
        }

        await FollowModel.create({
            follower: new Types.ObjectId(followerId),
            following: new Types.ObjectId(followingId),
        });
        return { following: true };
    }

    async getFollowers(userId: string) {
        return FollowModel.find({ following: new Types.ObjectId(userId) })
            .populate("follower", "username displayName avatar")
            .lean();
    }

    async getFollowing(userId: string) {
        return FollowModel.find({ follower: new Types.ObjectId(userId) })
            .populate("following", "username displayName avatar")
            .lean();
    }
}