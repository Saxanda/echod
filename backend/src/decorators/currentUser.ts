// src/decorators/currentUser.ts
import { createParamDecorator, Action } from "routing-controllers";

export function CurrentUser() {
    return createParamDecorator((action: Action) => {
        const user = action.request.user;
        if (!user) throw new Error("Unauthorized");
        return user;
    });
}