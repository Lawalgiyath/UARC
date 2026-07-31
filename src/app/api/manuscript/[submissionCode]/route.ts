import { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api/api-handler";
import { ApiResponse } from "@/lib/api/api-response";
import { manuscriptService } from "@/lib/manuscript/manuscript.service";

type RouteContext = {
    params: Promise<{
        submissionCode: string;
    }>;
};

export const GET = apiHandler(
    async (
        _request: NextRequest,
        context: RouteContext
    ) => {
        const { submissionCode } =
            await context.params;

        const manuscript =
            await manuscriptService.getManuscript(
                submissionCode
            );

        return ApiResponse.success(
            manuscript,
            "Manuscript retrieved successfully."
        );
    }
);