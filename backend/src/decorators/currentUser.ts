// src/decorators/currentUser.ts
import { createParamDecorator, Action } from "routing-controllers";

export function CurrentUser() {
    return createParamDecorator({
        value: (action: Action) => action.request.user ?? null
    });
}