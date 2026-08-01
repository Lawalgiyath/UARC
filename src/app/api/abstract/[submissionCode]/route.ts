import { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api/api-handler";
import { ApiResponse } from "@/lib/api/api-response";
import { getSubmissionSchema } from "@/lib/abstract/abstract.validation";
import { submissionService } from "@/lib/abstract/abstract.service";

interface RouteContext {
    params: Promise<{
        submissionCode: string;
    }>;
}

export const GET = apiHandler(
    async (
        _request: NextRequest,
        context: RouteContext
    ) => {
        const { submissionCode } =
            await context.params;

        const input =
            getSubmissionSchema.parse({
                submissionCode,
            });

        const submission =
            await submissionService.getSubmissionByCode(
                input.submissionCode
            );

        return ApiResponse.success(
            submission,
            "Submission retrieved successfully."
        );
    }
);