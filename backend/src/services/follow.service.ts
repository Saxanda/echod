// services/follow.service.ts
import { FollowModel } from "../models/Follow";

export class FollowService {
    async toggle(followerId: string, followingId: string) {
        if (followerId === followingId) {
            throw new Error("Cannot follow yourself");
        }

        const existing = await FollowModel.findOne({
            follower: followerId,
            following: followingId,
        });

        if (existing) {
            await existing.deleteOne();
            return { following: false };
        }

        await FollowModel.create({ follower: followerId, following: followingId });
        return { following: true };
    }

    async getFollowers(userId: string) {
        return FollowModel.find({ following: userId })
            .populate("follower", "username displayName avatar")
            .lean();
    }

    async getFollowing(userId: string) {
        return FollowModel.find({ follower: userId })
            .populate("following", "username displayName avatar")
            .lean();
    }
}