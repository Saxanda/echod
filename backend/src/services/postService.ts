// services/postService.ts
import {Service} from "typedi";
import {PostModel} from "../models/Post";
import {FollowModel} from "../models/Follow";
import {AppGateway} from "../gateway/appGateway";

@Service()
export class PostService {
    constructor(private gateway: AppGateway) {
    }

    // Feed: posts from people the user follows
    async getFeed(userId: string, search?: string) {
        const follows = await FollowModel.find({follower: userId}).lean();
        const followingIds = follows.map((f) => f.following);

        const query: any = {author: {$in: followingIds}};
        if (search) query.text = {$regex: search, $options: "i"};

        return PostModel.find(query)
            .sort({createdAt: -1})
            .populate("author", "username displayName avatar")
            .lean();
    }

    async create(userId: string, text: string, imageUrl?: string) {
        const post = await PostModel.create({
            text,
            author: userId,
            image: imageUrl ?? "",
        });

        const populated = await PostModel.findById(post._id)
            .populate("author", "username displayName avatar");
            // .lean();

        // Notify followers via Socket.io
        const followers = await FollowModel.find({following: userId}).lean();
        const followerIds = followers.map((f) => String(f.follower));
        this.gateway.notifyFollowers(followerIds, populated);

        return populated;
    }

    async getMyPosts(userId: string) {
        return PostModel.find({author: userId})
            .sort({createdAt: -1})
            .populate("author", "username displayName avatar")
            .lean();
    }

    async delete(userId: string, postId: string) {
        const post = await PostModel.findById(postId);
        if (!post) throw new Error("Post not found");
        if (String(post.author) !== userId) throw new Error("Unauthorized");
        await post.deleteOne();
        return {success: true};
    }

    async toggleLike(userId: string, postId: string) {
        const post = await PostModel.findById(postId);
        if (!post) throw new Error("Post not found");

        const alreadyLiked = post.likes.some(
            (id) => String(id) === userId
        );

        if (alreadyLiked) {
            post.likes = post.likes.filter((id) => String(id) !== userId);
        } else {
            post.likes.push(userId as any);
        }

        await post.save();
        return {liked: !alreadyLiked, likesCount: post.likes.length};
    }

    async getLikedPosts(userId: string) {
        return PostModel.find({likes: userId})
            .sort({createdAt: -1})
            .populate("author", "username displayName avatar")
            .lean();
    }
}