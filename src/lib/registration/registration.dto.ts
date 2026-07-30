import type {
    Registration,
    StudentVerification,
    Payment,
    QRCode,
} from "@prisma/client";

export interface RegistrationDto {
    id: string;
    registrationCode: string;

    fullName: string;
    email: string;
    phoneNumber: string;

    institution: string;

    category: string;

    amountDue: number;
    currency: string;

    paymentStatus: string;
    registrationStatus: string;

    createdAt: Date;
    updatedAt: Date;
}

export interface RegistrationDetailsDto extends RegistrationDto {
    studentVerification?: StudentVerificationDto | null;

    qrCode?: QRCodeDto | null;

    payments: PaymentDto[];
}

export interface RegistrationVerificationDto {
  registrationCode: string;

  fullName: string;

  email: string;

  category: string;

  amountDue: number;

  currency: string;

  registrationStatus: string;

  paymentStatus: string;

  qrGenerated: boolean;

  studentVerificationStatus: string | null;

  createdAt: Date;
}

export interface StudentVerificationDto {
    studentIdNumber: string;

    institutionName: string;

    verificationStatus: string;

    verifiedBy: string | null;

    verifiedAt: Date | null;

    rejectionReason: string | null;
}

export interface PaymentDto {
    transactionRef: string;

    gatewayReference: string | null;

    amountPaid: number;

    currency: string;

    status: string;

    paidAt: Date | null;
}

export interface QRCodeDto {
    token: string;

    qrImagePath: string | null;

    generatedAt: Date;

    expiresAt: Date | null;
}

export type RegistrationWithRelations = Registration & {
    studentVerification: StudentVerification | null;

    qrCode: QRCode | null;

    payments: Payment[];
};

export function toRegistrationDto(
    registration: Registration
): RegistrationDto {
    return {
        id: registration.id,

        registrationCode: registration.registrationCode,

        fullName: registration.fullName,

        email: registration.email,

        phoneNumber: registration.phoneNumber,

        institution: registration.institution,

        category: registration.category,

        amountDue: Number(registration.amountDue),

        currency: registration.currency,

        paymentStatus: registration.paymentStatus,

        registrationStatus: registration.registrationStatus,

        createdAt: registration.createdAt,

        updatedAt: registration.updatedAt,
    };
}

export function toRegistrationDetailsDto(
    registration: RegistrationWithRelations
): RegistrationDetailsDto {
    return {
        ...toRegistrationDto(registration),

        studentVerification: registration.studentVerification
            ? toStudentVerificationDto(
                registration.studentVerification
            )
            : null,

        qrCode: registration.qrCode
            ? toQRCodeDto(registration.qrCode)
            : null,

        payments: registration.payments.map(
            toPaymentDto
        ),
    };
}

export function toRegistrationVerificationDto(
  registration: RegistrationWithRelations
): RegistrationVerificationDto {
  return {
    registrationCode: registration.registrationCode,

    fullName: registration.fullName,

    email: registration.email,

    category: registration.category,

    amountDue: Number(registration.amountDue),

    currency: registration.currency,

    registrationStatus: registration.registrationStatus,

    paymentStatus: registration.paymentStatus,

    qrGenerated: registration.qrCode !== null,

    studentVerificationStatus:
      registration.studentVerification
        ?.verificationStatus ?? null,

    createdAt: registration.createdAt,
  };
}

export function toStudentVerificationDto(
    verification: StudentVerification
): StudentVerificationDto {
    return {
        studentIdNumber: verification.studentIdNumber,

        institutionName: verification.institutionName,

        verificationStatus: verification.verificationStatus,

        verifiedBy: verification.verifiedBy,

        verifiedAt: verification.verifiedAt,

        rejectionReason: verification.rejectionReason,
    };
}

export function toPaymentDto(
    payment: Payment
): PaymentDto {
    return {
        transactionRef: payment.transactionRef,

        gatewayReference: payment.gatewayReference,

        amountPaid: Number(payment.amountPaid),

        currency: payment.currency,

        status: payment.status,

        paidAt: payment.paidAt,
    };
}

export function toQRCodeDto(
    qrCode: QRCode
): QRCodeDto {
    return {
        token: qrCode.token,

        qrImagePath: qrCode.qrImagePath,

        generatedAt: qrCode.generatedAt,

        expiresAt: qrCode.expiresAt,
    };
}