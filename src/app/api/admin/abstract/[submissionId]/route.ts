import { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api/api-handler";
import { ApiResponse } from "@/lib/api/api-response";
import { submissionService } from "@/lib/abstract/abstract.service";

interface RouteContext {
    params: Promise<{
        submissionId: string;
    }>;
}

export const GET =
    apiHandler<RouteContext>(
        async (
            _request,
            context
        ) => {
            const { submissionId } =
                await context.params;

            const submission =
                await submissionService.getSubmissionById(
                    submissionId
                );

            return ApiResponse.success(
                submission,
                "Submission retrieved successfully."
            );
        }
    );