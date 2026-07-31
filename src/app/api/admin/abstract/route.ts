import { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api/api-handler";
import { ApiResponse } from "@/lib/api/api-response";
import { listSubmissionsSchema } from "@/lib/abstract/abstract.validation";
import { submissionService } from "@/lib/abstract/abstract.service";

export const GET = apiHandler(
    async (request: NextRequest) => {
        const searchParams =
            request.nextUrl.searchParams;

        const query =
            listSubmissionsSchema.parse({
                page: searchParams.get("page"),

                pageSize:
                    searchParams.get("pageSize"),

                search:
                    searchParams.get("search") ??
                    undefined,

                track:
                    searchParams.get("track") ??
                    undefined,

                reviewStatus:
                    searchParams.get(
                        "reviewStatus"
                    ) ?? undefined,

                presentationPreference:
                    searchParams.get(
                        "presentationPreference"
                    ) ?? undefined,
            });

        const submissions =
            await submissionService.listSubmissions(
                query
            );

        return ApiResponse.success(
            submissions,
            "Submissions retrieved successfully."
        );
    }
);