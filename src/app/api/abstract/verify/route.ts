import { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api/api-handler";
import { ApiResponse } from "@/lib/api/api-response";
import { verifySubmissionSchema } from "@/lib/abstract/abstract.validation";
import { submissionService } from "@/lib/abstract/abstract.service";

export const POST = apiHandler(
    async (request: NextRequest) => {
        const body = await request.json();

        const input =
            verifySubmissionSchema.parse(body);

        const submission =
            await submissionService.verifySubmission(
                input
            );

        return ApiResponse.success(
            submission,
            "Submission verified successfully."
        );
    }
);