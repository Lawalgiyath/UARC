import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api/api-response";
import { apiHandler } from "@/lib/api/api-handler";
import { getCurrentAdmin } from "@/lib/auth/current-admin";
import { assignReviewerSchema, } from "@/lib/reviewer/reviewer.validation";
import { reviewerService } from "@/lib/reviewer/reviewer.service";


export const POST = apiHandler(
    async (
        request: NextRequest
    ) => {

        const admin =
            await getCurrentAdmin();

        if (!admin) {
            return ApiResponse.error(
                "Authentication required.",
            );
        }

        const body =
            await request.json();

        const data =
            assignReviewerSchema.parse(
                body
            );

        const assignment =
            await reviewerService.assignReviewer(
                data,
                admin.id
            );

        return ApiResponse.success(
            assignment,
            "Reviewer assigned successfully."
        );
    }
);