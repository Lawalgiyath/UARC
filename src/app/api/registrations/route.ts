import { NextRequest } from "next/server";
import { RegistrationCategory } from "@prisma/client";
import { createRegistrationSchema } from "@/lib/registration/registration.validation";
import { registrationService } from "@/lib/registration/registration.service";
import { studentUploadService } from "@/lib/storage/student-upload.service";
import { ApiResponse } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/api-errors";

const STUDENT_CATEGORIES = new Set<RegistrationCategory>([
  RegistrationCategory.STUDENT_EARLY_BIRD,
  RegistrationCategory.STUDENT_REGULAR,
]);

export async function POST(
  request: NextRequest
) {
  try {
    const formData = await request.formData();

    const category =
      formData.get(
        "category"
      ) as RegistrationCategory;

    const isStudent =
      STUDENT_CATEGORIES.has(category);

    let studentIdFront: string | undefined;
    let studentIdBack: string | undefined;

    if (isStudent) {
      const frontFile =
        formData.get("studentIdFront");

      const backFile =
        formData.get("studentIdBack");

      if (
        !(frontFile instanceof File) ||
        !(backFile instanceof File)
      ) {
        return ApiResponse.badRequest(
          "Student ID front and back images are required."
        );
      }

      const [
        frontUpload,
        backUpload,
      ] = await Promise.all([
        studentUploadService.uploadStudentId(
          frontFile,
          "front"
        ),

        studentUploadService.uploadStudentId(
          backFile,
          "back"
        ),
      ]);

      studentIdFront =
        frontUpload.storagePath;

      studentIdBack =
        backUpload.storagePath;
    }

    const input =
      createRegistrationSchema.parse({
        fullName:
          formData.get("fullName"),

        email:
          formData.get("email"),

        phoneNumber:
          formData.get("phoneNumber"),

        institution:
          formData.get("institution"),

        category,

        studentIdNumber:
          formData.get(
            "studentIdNumber"
          ) ?? undefined,

        studentInstitutionName:
          formData.get(
            "studentInstitutionName"
          ) ?? undefined,

        studentIdFront,

        studentIdBack,
      });

    const registration =
      await registrationService.createRegistration(
        input
      );

    return ApiResponse.created(
      registration,
      "Registration created successfully.",
      {
        Location: `/api/registrations/${registration.registrationCode}`,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}