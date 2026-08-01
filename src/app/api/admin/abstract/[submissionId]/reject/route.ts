import { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api/api-handler";
import { ApiResponse } from "@/lib/api/api-response";
import { rejectSubmissionSchema } from "@/lib/abstract/abstract.validation";
import { submissionService } from "@/lib/abstract/abstract.service";

interface RouteContext {
    params: Promise<{
        submissionId: string;
    }>;
}

export const PATCH =
    apiHandler<RouteContext>(
        async (
            request: NextRequest,
            context
        ) => {
            const { submissionId } =
                await context.params;

            const body =
                await request.json();

            const input =
                rejectSubmissionSchema.parse({
                    submissionId,
                    ...body,
                });

            const submission =
                await submissionService.rejectSubmission(
                    input.submissionId,
                    input.reviewerComment
                );

            return ApiResponse.success(
                submission,
                "Submission rejected successfully."
            );
        }
    );