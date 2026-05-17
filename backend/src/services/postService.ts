// backend/src/services/postService.ts
import {Service} from "typedi";
import {PostModel} from "../models/Post";
import { UserModel } from "../models/User";
import {FollowModel} from "../models/Follow";
import {AppGateway} from "../gateway/appGateway";
import {Types} from "mongoose";

@Service()
export class PostService {

    constructor(private gateway: AppGateway) {
    }
    private mapPost(post: any, userId?: string) {
        return {
            id: String(post._id),
            text: post.text,
            imageUrl: post.image || "",
            createdAt: post.createdAt,
            author: post.author,
            likesCount: post.likes?.length || 0,
            likedByMe: userId
                ? post.likes?.some((id: any) => String(id) === userId)
                : false,
        };
    }
    async getFeed(userId: string, search?: string) {
        const follows = await FollowModel.find({
            follower: new Types.ObjectId(userId),
        }).lean();

        const followingIds = follows.map((f) => f.following);

        const query: any = {
            author: {
                $in: [new Types.ObjectId(userId), ...followingIds],
            },
        };

        if (search) {
            query.text = { $regex: search, $options: "i" };
        }

        const posts = await PostModel.find(query)
            .sort({ createdAt: -1 })
            .populate("author", "username displayName avatar")
            .lean();

        return {
            posts: posts.map((post) => this.mapPost(post, userId)),
        };
    }

    async create(userId: string, text: string, imageUrl?: string) {
        const post = await PostModel.create({
            text,
            author: new Types.ObjectId(userId),
            image: imageUrl ?? "",
        });

        const populated = await PostModel.findById(post._id)
            .populate("author", "username displayName avatar")
            .lean();

        const mappedPost = this.mapPost(populated, userId);

        const followers = await FollowModel.find({
            following: new Types.ObjectId(userId),
        }).lean();

        const followerIds = followers.map((f) => String(f.follower));

        this.gateway.notifyFollowers(followerIds, mappedPost);

        return mappedPost;
    }

    async getMyPosts(userId: string) {
        const posts = await PostModel.find({
            author: new Types.ObjectId(userId),
        })
            .sort({ createdAt: -1 })
            .populate("author", "username displayName avatar")
            .lean();

        return {
            posts: posts.map((post) => this.mapPost(post, userId)),
        };
    }
    async getPostsByUsername(username: string, currentUserId?: string) {
        const user = await UserModel.findOne({ username }).lean();

        if (!user) {
            throw new Error("User not found");
        }

        const posts = await PostModel.find({ author: user._id })
            .sort({ createdAt: -1 })
            .populate("author", "username displayName avatar")
            .lean();

        return {
            posts: posts.map((post) => this.mapPost(post, currentUserId)),
        };
    }
    async delete(userId: string, postId: string) {
        const post = await PostModel.findById(postId);
        if (!post) throw new Error("Post not found");
        if (String(post.author) !== userId) throw new Error("Unauthorized");
        await post.deleteOne();
        return {success: true};
    }

    async toggleLike(userId: string, postId: any) {
        const cleanPostId =
            typeof postId === "string"
                ? postId
                : postId?._id
                    ? String(postId._id)
                    : String(postId);

        console.log("LIKE postId:", cleanPostId);

        if (!Types.ObjectId.isValid(cleanPostId)) {
            throw new Error("Invalid post id");
        }

        const post = await PostModel.findById(cleanPostId);

        if (!post) {
            throw new Error("Post not found");
        }

        const alreadyLiked = post.likes.some(
            (id) => String(id) === userId
        );

        if (alreadyLiked) {
            post.likes = post.likes.filter(
                (id) => String(id) !== userId
            );
        } else {
            post.likes.push(new Types.ObjectId(userId) as any);
        }

        await post.save();

        return {
            id: String(post._id),
            likedByMe: !alreadyLiked,
            likesCount: post.likes.length,
        };
    }

    async getLikedPosts(userId: string) {
        const posts = await PostModel.find({
            likes: new Types.ObjectId(userId),
        })
            .sort({ createdAt: -1 })
            .populate("author", "username displayName avatar")
            .lean();

        return {
            posts: posts.map((post) => this.mapPost(post, userId)),
        };
    }
}