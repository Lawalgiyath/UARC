import { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api/api-handler";
import { ApiResponse } from "@/lib/api/api-response";
import { uploadManuscriptSchema } from "@/lib/manuscript/manuscript.validation";
import { manuscriptService } from "@/lib/manuscript/manuscript.service";

export const POST = apiHandler(
    async (request: NextRequest) => {
        const formData =
            await request.formData();

        const file =
            formData.get("manuscript");

        if (!(file instanceof File)) {
            return ApiResponse.badRequest(
                "A manuscript file is required."
            );
        }

        const input =
            uploadManuscriptSchema.parse({
                submissionCode:
                    formData.get(
                        "submissionCode"
                    ),

                email:
                    formData.get("email"),
            });

        const manuscript =
            await manuscriptService.uploadManuscript(
                input.submissionCode,
                input.email,
                file
            );

        return ApiResponse.created(
            manuscript,
            "Manuscript uploaded successfully."
        );
    }
);