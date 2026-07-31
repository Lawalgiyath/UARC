import { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api/api-handler";
import { ApiResponse } from "@/lib/api/api-response";
import { manuscriptService } from "@/lib/manuscript/manuscript.service";
import { listManuscriptsSchema } from "@/lib/manuscript/manuscript.validation";

export const GET = apiHandler(
    async (request: NextRequest) => {
        const { searchParams } =
            new URL(request.url);

        const query =
            listManuscriptsSchema.parse({
                page:
                    searchParams.get("page"),

                limit:
                    searchParams.get("limit"),

                track:
                    searchParams.get("track"),

                reviewStatus:
                    searchParams.get(
                        "reviewStatus"
                    ),

                search:
                    searchParams.get("search"),
            });

        const result =
            await manuscriptService.listManuscripts(
                query
            );

        return ApiResponse.success(
            result,
            "Manuscripts retrieved successfully."
        );
    }
);