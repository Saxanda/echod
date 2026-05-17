// src/services/userService.ts
import {Container, Service} from "typedi";
import {UserModel} from "../models/User";
import {FollowModel} from "../models/Follow";
import {NotificationService} from "./notificationService";
import {UpdateProfileDto} from "../dto/user.dto";
import {Types} from "mongoose";

@Service()
export class UserService {
    async findById(userId: string) {
        return UserModel.findById(userId)
            .select("-password -emailVerificationToken -passwordResetToken")
            .lean();
    }

    async findByUsername(username: string, currentUserId: string) {
        const user = await UserModel.findOne({username})
            .select("-password -emailVerificationToken -passwordResetToken")
            .lean();

        if (!user) throw new Error("User not found");

        const followersCount = await FollowModel.countDocuments({
            following: user._id,
        });

        const followingCount = await FollowModel.countDocuments({
            follower: user._id,
        });

        let isFollowing = false;

        if (
            currentUserId &&
            Types.ObjectId.isValid(currentUserId)
        ) {
            const follow = await FollowModel.exists({
                follower: new Types.ObjectId(currentUserId),
                following: user._id,
            });

            isFollowing = !!follow;
        }

        return {
            ...user,
            id: String(user._id),
            followersCount,
            followingCount,
            isFollowing,
            isMe: currentUserId
                ? String(user._id) === currentUserId
                : false,
        };
    }

    async search(query: string, currentUserId: string) {
        if (!query) return [];
        return UserModel.find({
            $or: [
                {username: {$regex: query, $options: "i"}},
                {displayName: {$regex: query, $options: "i"}},
            ],
            _id: {$ne: new Types.ObjectId(currentUserId)},
        })
            .select("username displayName avatar")
            .limit(10)
            .lean();
    }

    async updateProfile(userId: string, dto: UpdateProfileDto) {
        const updated = await UserModel.findByIdAndUpdate(
            userId,
            {$set: dto},
            {returnDocument: "after"}
        ).select("-password -emailVerificationToken -passwordResetToken");

        if (!updated) throw new Error("User not found");
        return updated;
    }

    async getProfile(currentUserId: string, username: string) {
        const user = await UserModel.findOne({username}).lean();

        if (!user) {
            throw new Error("User not found");
        }

        return {
            id: String(user._id),
            username: user.username,
            displayName: user.displayName,
            avatar: user.avatar,
            headerImage: user.headerImage,
            bio: user.bio,
            isMe: String(user._id) === currentUserId,
        };
    }

    async toggleFollow(followerId: string, followingId: string) {
        if (followerId === followingId) {
            throw new Error("Cannot follow yourself");
        }

        const existing = await FollowModel.findOne({
            follower: new Types.ObjectId(followerId),
            following: new Types.ObjectId(followingId),
        });

        if (existing) {
            await existing.deleteOne();

            return {
                following: false,
            };
        }

        await FollowModel.create({
            follower: new Types.ObjectId(followerId),
            following: new Types.ObjectId(followingId),
        });

        const notificationService =
            Container.get(NotificationService);

        await notificationService.createNewFollowerNotification(
            followingId,
            followerId,
        );

        return {
            following: true,
        };
    }

    async getFollowers(userId: string) {
        const followers = await FollowModel.find({
            following: new Types.ObjectId(userId),
        })
            .populate("follower", "username displayName avatar")
            .lean();

        return {
            followers: followers.map((item: any) => item.follower),
        };
    }

    async getFollowing(userId: string) {
        const following = await FollowModel.find({
            follower: new Types.ObjectId(userId),
        })
            .populate("following", "username displayName avatar")
            .lean();

        return {
            following: following.map((item: any) => item.following),
        };
    }
}