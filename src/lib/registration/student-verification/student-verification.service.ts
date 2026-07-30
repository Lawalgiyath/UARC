import {
  AuditAction,
  Prisma,
  StudentVerificationStatus,
} from "@prisma/client";

import { db } from "@/lib/db";

import { auditService } from "@/lib/audit/audit.service";

import {
  toStudentVerificationDetailsDto,
  toStudentVerificationDto,
} from "./student-verification.dto";

import type {
  StudentVerificationDto,
  StudentVerificationDetailsDto,
  StudentVerificationWithRegistration,
} from "./student-verification.dto";

import type {
  ApproveStudentVerificationData,
  PaginatedResult,
  RejectStudentVerificationData,
  StudentVerificationListQuery,
} from "./student-verification.types";

import {
  studentVerificationInclude,
} from "./student-verification.types";

export class StudentVerificationServiceError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly code: string
  ) {
    super(message);

    this.name =
      "StudentVerificationServiceError";
  }
}

export class StudentVerificationNotFoundError
  extends StudentVerificationServiceError {
  constructor() {
    super(
      "Student verification was not found.",
      404,
      "STUDENT_VERIFICATION_NOT_FOUND"
    );
  }
}

export class StudentAlreadyVerifiedError
  extends StudentVerificationServiceError {
  constructor() {
    super(
      "Student has already been verified.",
      409,
      "STUDENT_ALREADY_VERIFIED"
    );
  }
}

export class StudentAlreadyRejectedError
  extends StudentVerificationServiceError {
  constructor() {
    super(
      "Student verification has already been rejected.",
      409,
      "STUDENT_ALREADY_REJECTED"
    );
  }
}


class StudentVerificationService {
  private readonly include =
    studentVerificationInclude;

  private readonly defaultOrderBy: Prisma.StudentVerificationOrderByWithRelationInput =
    {
      createdAt: "desc",
    };

  async listVerifications(
    query: StudentVerificationListQuery
  ): Promise<
    PaginatedResult<StudentVerificationDto>
  > {

    const {
      page,
      pageSize,
      search,
      verificationStatus,
      institution,
    } = query;


    const where: Prisma.StudentVerificationWhereInput =
    {
      ...(verificationStatus && {
        verificationStatus,
      }),

      ...(institution && {
        institutionName: {
          contains: institution,
          mode: "insensitive",
        },
      }),

      ...(search && {
        OR: [
          {
            studentIdNumber: {
              contains: search,
              mode: "insensitive",
            },
          },

          {
            institutionName: {
              contains: search,
              mode: "insensitive",
            },
          },

          {
            registration: {
              fullName: {
                contains: search,
                mode: "insensitive",
              },
            },
          },

          {
            registration: {
              email: {
                contains: search,
                mode: "insensitive",
              },
            },
          },

          {
            registration: {
              registrationCode: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        ],
      }),
    };


    const skip =
      (page - 1) * pageSize;


    const [
      totalItems,
      verifications,
    ] = await db.$transaction([
      db.studentVerification.count({
        where,
      }),

      db.studentVerification.findMany({
        where,

        include: this.include,

        orderBy: this.defaultOrderBy,

        skip,

        take: pageSize,
      }),
    ]);


    const totalPages = Math.ceil(
      totalItems / pageSize
    );


    return {
      items: verifications.map(
        toStudentVerificationDto
      ),

      meta: {
        page,

        pageSize,

        totalItems,

        totalPages,

        hasNextPage:
          page < totalPages,

        hasPreviousPage:
          page > 1,
      },
    };
  }

async getVerificationById(
  verificationId: string
): Promise<StudentVerificationDetailsDto> {

  const verification =
    await db.studentVerification.findUnique({
      where: {
        id: verificationId,
      },

      include: this.include,
    });


  if (!verification) {
    throw new StudentVerificationNotFoundError();
  }


  return toStudentVerificationDetailsDto(
    verification
  );
}

async approveVerification(
  data: ApproveStudentVerificationData
): Promise<StudentVerificationDetailsDto> {

  const updatedVerification =
    await db.$transaction(async (tx) => {

      const verification =
        await tx.studentVerification.findUnique({
          where: {
            id: data.verificationId,
          },

          include: this.include,
        });


      if (!verification) {
        throw new StudentVerificationNotFoundError();
      }


      if (
        verification.verificationStatus ===
        StudentVerificationStatus.APPROVED
      ) {
        throw new StudentAlreadyVerifiedError();
      }


      if (
        verification.verificationStatus ===
        StudentVerificationStatus.REJECTED
      ) {
        throw new StudentVerificationServiceError(
          "Rejected verification cannot be approved.",
          409,
          "VERIFICATION_ALREADY_REJECTED"
        );
      }


      const updated: StudentVerificationWithRegistration =
        await tx.studentVerification.update({
          where: {
            id: data.verificationId,
          },

          data: {
            verificationStatus:
              StudentVerificationStatus.APPROVED,

            verifiedBy:
              data.verifiedBy,

            verifiedAt:
              new Date(),

            rejectionReason:
              "",
          },

          include: this.include,
        });


      await auditService.log({
        action:
          AuditAction.VERIFY_STUDENT,

        entity:
          "StudentVerification",

        entityId:
          updated.id,

        newValue: {
          verificationStatus:
            updated.verificationStatus,

          verifiedBy:
            updated.verifiedBy,

          registrationId:
            updated.registrationId,
        },
      });


      return updated;
    });


  return toStudentVerificationDetailsDto(
    updatedVerification
  );
}

async rejectVerification(
  data: RejectStudentVerificationData
): Promise<StudentVerificationDetailsDto> {

  const updatedVerification =
    await db.$transaction(async (tx) => {

      const verification =
        await tx.studentVerification.findUnique({
          where: {
            id: data.verificationId,
          },

          include: this.include,
        });


      if (!verification) {
        throw new StudentVerificationNotFoundError();
      }


      if (
        verification.verificationStatus ===
        StudentVerificationStatus.REJECTED
      ) {
        throw new StudentAlreadyRejectedError();
      }


      if (
        verification.verificationStatus ===
        StudentVerificationStatus.APPROVED
      ) {
        throw new StudentVerificationServiceError(
          "Approved verification cannot be rejected.",
          409,
          "VERIFICATION_ALREADY_APPROVED"
        );
      }


      const updated =
        await tx.studentVerification.update({
          where: {
            id: data.verificationId,
          },

          data: {
            verificationStatus:
              StudentVerificationStatus.REJECTED,

            verifiedBy:
              data.rejectedBy,

            verifiedAt:
              new Date(),

            rejectionReason:
              data.rejectionReason,
          },

          include: this.include,
        });


      await auditService.log({
        action:
          AuditAction.VERIFY_STUDENT,

        entity:
          "StudentVerification",

        entityId:
          updated.id,

        newValue: {
          verificationStatus:
            updated.verificationStatus,

          rejectionReason:
            updated.rejectionReason,

          rejectedBy:
            data.rejectedBy,

          registrationId:
            updated.registrationId,
        },
      });


      return updated;
    });


  return toStudentVerificationDetailsDto(
    updatedVerification
  );
}
}

export const studentVerificationService =
  new StudentVerificationService();