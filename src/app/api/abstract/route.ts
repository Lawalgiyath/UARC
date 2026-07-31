import { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api/api-handler";
import { ApiResponse } from "@/lib/api/api-response";
import { createSubmissionSchema } from "@/lib/abstract/abstract.validation";
import { submissionService } from "@/lib/abstract/abstract.service";

export const POST = apiHandler(
    async (request: NextRequest) => {
        const body = await request.json();

        const input =
            createSubmissionSchema.parse(body);

        const submission =
            await submissionService.createSubmission(
                input
            );

        return ApiResponse.created(
            submission,
            "Abstract submitted successfully."
        );
    }
);