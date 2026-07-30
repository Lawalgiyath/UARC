import type {
  Registration,
  StudentVerification,
  StudentVerificationStatus,
} from "@prisma/client";


export interface StudentVerificationDto {
  id: string;

  registrationId: string;

  studentIdNumber: string;

  institutionName: string;

  studentIdFrontUrl: string;

  studentIdBackUrl: string;

  verificationStatus: StudentVerificationStatus;

  verifiedBy: string | null;

  verifiedAt: Date | null;

  rejectionReason: string | null;

  createdAt: Date;
}


export interface StudentVerificationDetailsDto
  extends StudentVerificationDto {
  registration: RegistrationSummaryDto;
}


export interface RegistrationSummaryDto {
  id: string;

  registrationCode: string;

  fullName: string;

  email: string;

  phoneNumber: string;

  institution: string;

  category: string;

  paymentStatus: string;

  registrationStatus: string;
}


export type StudentVerificationWithRegistration =
  StudentVerification & {
    registration: Registration;
  };

export function toStudentVerificationDto(
  verification: StudentVerification
): StudentVerificationDto {
  return {
    id: verification.id,

    registrationId: verification.registrationId,

    studentIdNumber: verification.studentIdNumber,

    institutionName: verification.institutionName,

    studentIdFrontUrl: verification.studentIdFront,

    studentIdBackUrl: verification.studentIdBack,

    verificationStatus:
      verification.verificationStatus,

    verifiedBy:
      verification.verifiedBy,

    verifiedAt:
      verification.verifiedAt,

    rejectionReason:
      verification.rejectionReason ?? null,

    createdAt:
      verification.createdAt,
  };
}


export function toRegistrationSummaryDto(
  registration: Registration
): RegistrationSummaryDto {
  return {
    id: registration.id,

    registrationCode:
      registration.registrationCode,

    fullName:
      registration.fullName,

    email:
      registration.email,

    phoneNumber:
      registration.phoneNumber,

    institution:
      registration.institution,

    category:
      registration.category,

    paymentStatus:
      registration.paymentStatus,

    registrationStatus:
      registration.registrationStatus,
  };
}


export function toStudentVerificationDetailsDto(
  verification: StudentVerificationWithRegistration
): StudentVerificationDetailsDto {
  return {
    ...toStudentVerificationDto(
      verification
    ),

    registration:
      toRegistrationSummaryDto(
        verification.registration
      ),
  };
}