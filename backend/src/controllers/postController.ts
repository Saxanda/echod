// src/controllers/postController.ts
import {Service} from "typedi";
import {Body, CurrentUser, Delete, Get, HttpCode, JsonController, Param, Post, QueryParam} from "routing-controllers";
import {PostService} from "../services/postService";
import {CreatePostDto} from "../dto/post.dto";
import {User} from "../models/User";


@JsonController("/posts")
@Service()
export class PostController {
    constructor(private postService: PostService) {
    }

    @Get("/feed")
    getFeed(
        @CurrentUser() user: User,
        @QueryParam("search") search?: string,
    ) {
        return this.postService.getFeed(String((user as any)._id), search);
    }

    @Post("/")
    @HttpCode(201)
    createPost(
        @CurrentUser() user: User,
        @Body() dto: CreatePostDto,
        // @UploadedFile("image", { required: false }) image?: Express.Multer.File,
    ) {
        return this.postService.create(String((user as any)._id), dto.text);
        // return this.postService.create(String((user as any)._id), dto.text, image?.path);
    }

    @Get("/me")
    getMyPosts(
        @CurrentUser() user: User,
    ) {
        return this.postService.getMyPosts(String((user as any)._id));
    }

    @Post("/:id/like")
    toggleLike(
        @CurrentUser() user: User,
        @Param("id") postId: string,
    ) {
        return this.postService.toggleLike(String((user as any)._id), postId);
    }

    @Get("/liked")
    getLikedPosts(
        @CurrentUser() user: User,
    ) {
        return this.postService.getLikedPosts(String((user as any)._id));
    }

    @Delete("/:id")
    deletePost(
        @CurrentUser() user: User,
        @Param("id") postId: string,
    ) {
        return this.postService.delete(String((user as any)._id), postId);
    }
}