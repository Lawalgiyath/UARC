import { NextRequest } from "next/server";
import { handleApiError } from "./api-errors";

export type ApiRouteHandler = (
    request: NextRequest
) => Promise<Response>;

export type ApiRouteHandlerWithContext<TContext> = (
    request: NextRequest,
    context: TContext
) => Promise<Response>;

export function apiHandler(
    handler: ApiRouteHandler
): ApiRouteHandler;

export function apiHandler<TContext>(
    handler: ApiRouteHandlerWithContext<TContext>
): ApiRouteHandlerWithContext<TContext>;

export function apiHandler<TContext>(
    handler:
        | ApiRouteHandler
        | ApiRouteHandlerWithContext<TContext>
) {
    return async (
        request: NextRequest,
        context?: TContext
    ) => {
        try {
            return await (
                handler as ApiRouteHandlerWithContext<TContext>
            )(request, context as TContext);
        } catch (error) {
            return handleApiError(error);
        }
    };
}