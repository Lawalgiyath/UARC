import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api/api-response";
import { apiHandler } from "@/lib/api/api-handler";
import { getCurrentAdmin, } from "@/lib/auth/current-admin";
import { submitReviewSchema, } from "@/lib/reviewer/reviewer.validation";
import { reviewerService, } from "@/lib/reviewer/reviewer.service";


export const POST = apiHandler(
    async (
        request: NextRequest
    ) => {

        const admin =
            await getCurrentAdmin();

        if (!admin) {
            return ApiResponse.unauthorized(
                "Authentication required."
            );
        }

        const body =
            await request.json();

        const data =
            submitReviewSchema.parse(
                {
                    ...body,

                    reviewerId:
                        admin.id,
                }
            );

        const review =
            await reviewerService.submitReview(
                data
            );

        return ApiResponse.created(
            review,
            "Review submitted successfully."
        );
    }
);