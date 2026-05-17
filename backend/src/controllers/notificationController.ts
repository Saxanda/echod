// backend/src/controllers/notificationController.ts
import { Get, JsonController, Param, Put } from "routing-controllers";
import { Service, Container } from "typedi";
import { CurrentUser } from "../decorators/currentUser";
import { User } from "../models/User";
import { NotificationService } from "../services/notificationService";

@JsonController("/notifications")
@Service()
export class NotificationController {
    private notificationService = Container.get(NotificationService);

    @Get("/")
    getMyNotifications(@CurrentUser() user: User) {
        return this.notificationService.getMyNotifications(
            String((user as any)._id),
        );
    }

    @Put("/:id/read")
    markAsRead(
        @CurrentUser() user: User,
        @Param("id") id: string,
    ) {
        return this.notificationService.markAsRead(
            String((user as any)._id),
            id,
        );
    }
}