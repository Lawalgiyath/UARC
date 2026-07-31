import { NextRequest } from "next/server";
import { handleApiError } from "./api-errors";

export type ApiRouteHandler<
    TContext = undefined,
> = (
    request: NextRequest,
    context: TContext
) => Promise<Response>;

export function apiHandler<
    TContext = undefined,
>(
    handler: ApiRouteHandler<TContext>
): ApiRouteHandler<TContext> {
    return async (
        request: NextRequest,
        context: TContext
    ) => {
        try {
            return await handler(
                request,
                context
            );
        } catch (error) {
            return handleApiError(error);
        }
    };
}