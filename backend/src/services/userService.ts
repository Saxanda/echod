// src/services/userService.ts
import { Service } from "typedi";
import { UserModel } from "../models/User";
import { FollowModel } from "../models/Follow";
import { UpdateProfileDto } from "../dto/user.dto";
import { Types } from "mongoose";

@Service()
export class UserService {
    async findById(userId: string) {
        return UserModel.findById(userId)
            .select("-password -emailVerificationToken -passwordResetToken")
            .lean();
    }

    async findByUsername(username: string, currentUserId: string) {
        const user = await UserModel.findOne({ username })
            .select("-password -emailVerificationToken -passwordResetToken")
            .lean();

        if (!user) throw new Error("User not found");

        const [followersCount, followingCount, isFollowing] = await Promise.all([
            FollowModel.countDocuments({ following: user._id }),
            FollowModel.countDocuments({ follower: user._id }),
            FollowModel.exists({
                follower: new Types.ObjectId(currentUserId),
                following: user._id,
            }),
        ]);

        return { ...user, followersCount, followingCount, isFollowing: !!isFollowing };
    }

    async search(query: string, currentUserId: string) {
        if (!query) return [];
        return UserModel.find({
            $or: [
                { username: { $regex: query, $options: "i" } },
                { displayName: { $regex: query, $options: "i" } },
            ],
            _id: { $ne: new Types.ObjectId(currentUserId) },
        })
            .select("username displayName avatar")
            .limit(10)
            .lean();
    }

    async updateProfile(userId: string, dto: UpdateProfileDto) {
        const updated = await UserModel.findByIdAndUpdate(
            userId,
            { $set: dto },
            { new: true },
        ).select("-password -emailVerificationToken -passwordResetToken");

        if (!updated) throw new Error("User not found");
        return updated;
    }

    async toggleFollow(followerId: string, followingId: string) {
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