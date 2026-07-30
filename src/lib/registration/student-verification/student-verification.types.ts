import {
  Prisma,
  StudentVerificationStatus,
} from "@prisma/client";


export interface StudentVerificationListQuery {
  page: number;

  pageSize: number;

  search?: string;

  verificationStatus?: StudentVerificationStatus;

  institution?: string;
}


export interface PaginationMeta {
  page: number;

  pageSize: number;

  totalItems: number;

  totalPages: number;

  hasNextPage: boolean;

  hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  items: T[];

  meta: PaginationMeta;
}

export const studentVerificationInclude =
  Prisma.validator<Prisma.StudentVerificationInclude>()({
    registration: true,
  });

export type StudentVerificationWithRegistration =
  Prisma.StudentVerificationGetPayload<{
    include: typeof studentVerificationInclude;
  }>;

export interface ApproveStudentVerificationData {
  verificationId: string;

  verifiedBy: string;
}

export interface RejectStudentVerificationData {
  verificationId: string;

  rejectedBy: string;

  rejectionReason: string;
}