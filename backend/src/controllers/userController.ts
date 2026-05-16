// src/controllers/userController.ts
import {
    JsonController, Get, Put, Delete,
    Param, Body, QueryParam,
    HttpCode, UseInterceptor, UploadedFile,
} from "routing-controllers";
import { Service } from "typedi";
import { UserService } from "../services/userService.js";
import { CurrentUser } from "../decorators/currentUser.js";
import { UpdateProfileDto } from "../dto/user.dto.js";
import { User } from "../models/User.js";

@JsonController("/users")
@Service()
export class UserController {
    constructor(private userService: UserService) {}

    // GET /api/users/me
    @Get("/me")
    getMe(@CurrentUser() user: User) {
        return this.userService.findById(String((user as any)._id));
    }

    // GET /api/users/:username
    @Get("/:username")
    getProfile(
        @Param("username") username: string,
        @CurrentUser() user: User,
    ) {
        return this.userService.findByUsername(
            username,
            String((user as any)._id),
        );
    }

    // GET /api/users/search?q=...
    @Get("/search")
    searchUsers(
        @QueryParam("q") q: string,
        @CurrentUser() user: User,
    ) {
        return this.userService.search(q, String((user as any)._id));
    }

    // PUT /api/users/me
    @Put("/me")
    updateProfile(
        @CurrentUser() user: User,
        @Body() dto: UpdateProfileDto,
    ) {
        return this.userService.updateProfile(
            String((user as any)._id),
            dto,
        );
    }

    // POST /api/users/:id/follow
    @Put("/:id/follow")
    toggleFollow(
        @CurrentUser() user: User,
        @Param("id") targetId: string,
    ) {
        return this.userService.toggleFollow(
            String((user as any)._id),
            targetId,
        );
    }

    // GET /api/users/:id/followers
    @Get("/:id/followers")
    getFollowers(@Param("id") userId: string) {
        return this.userService.getFollowers(userId);
    }

    // GET /api/users/:id/following
    @Get("/:id/following")
    getFollowing(@Param("id") userId: string) {
        return this.userService.getFollowing(userId);
    }
}