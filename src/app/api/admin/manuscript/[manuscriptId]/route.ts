import { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api/api-handler";
import { ApiResponse } from "@/lib/api/api-response";
import { manuscriptService } from "@/lib/manuscript/manuscript.service";

type RouteContext = {
    params: Promise<{
        manuscriptId: string;
    }>;
};

export const GET = apiHandler(
    async (
        _request: NextRequest,
        context: RouteContext
    ) => {
        const {
            manuscriptId,
        } =
            await context.params;

        const manuscript =
            await manuscriptService.getManuscriptById(
                manuscriptId
            );

        return ApiResponse.success(
            manuscript,
            "Manuscript retrieved successfully."
        );
    }
);