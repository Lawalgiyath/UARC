import {
  Prisma,
  RegistrationCategory,
  RegistrationStatus,
  StudentVerificationStatus,
  AuditAction,
  PaymentStatus
} from "@prisma/client";

import { db } from "@/lib/db";

import type { CreateRegistrationInput, VerifyRegistrationInput } from "./registration.validation";

import {
  RegistrationDetailsDto,
  RegistrationDto, toRegistrationDto, toRegistrationDetailsDto, RegistrationVerificationDto, toRegistrationVerificationDto
} from "./registration.dto";
import { randomBytes } from "crypto";
import { auditService } from "../audit/audit.service";
import { RegistrationListQuery, PaginatedRegistrationDto } from "./registration.types";


export class RegistrationServiceError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly code: string
  ) {
    super(message);
    this.name = "RegistrationServiceError";
  }
}

export class RegistrationNotFoundError extends RegistrationServiceError {
  constructor() {
    super(
      "Registration not found.",
      404,
      "REGISTRATION_NOT_FOUND"
    );
  }
}

export class DuplicateRegistrationError extends RegistrationServiceError {
  constructor() {
    super(
      "A registration already exists for this email address.",
      409,
      "DUPLICATE_REGISTRATION"
    );
  }
}

export class RegistrationClosedError extends RegistrationServiceError {
  constructor() {
    super(
      "Registration is currently closed.",
      403,
      "REGISTRATION_CLOSED"
    );
  }
}

export class ConferenceConfigurationError extends RegistrationServiceError {
  constructor(message: string) {
    super(
      message,
      500,
      "CONFERENCE_CONFIGURATION_ERROR"
    );
  }
}

const REGISTRATION_CODE_PREFIX = "UARC";

const STUDENT_CATEGORIES: readonly RegistrationCategory[] = [
  RegistrationCategory.STUDENT_EARLY_BIRD,
  RegistrationCategory.STUDENT_REGULAR,
] as const;

class RegistrationService {
  async createRegistration(
    input: CreateRegistrationInput
  ): Promise<RegistrationDto> {
    const settings = await this.validateConferenceState();

    await this.ensureUniqueEmail(input.email);

    const { amount, currency } = this.calculateRegistrationFee(
      input.category,
      settings
    );

    const registrationCode = await this.generateRegistrationCode(
      settings.conferenceYear
    );

    const registration = await db.$transaction(async (tx) => {
      const createdRegistration = await tx.registration.create({
        data: {
          registrationCode,

          fullName: input.fullName,

          email: input.email,

          phoneNumber: input.phoneNumber,

          institution: input.institution,

          category: input.category,

          amountDue: amount,

          currency,

          paymentStatus: PaymentStatus.PENDING,

          registrationStatus: RegistrationStatus.PENDING,
        },
      });

      if (STUDENT_CATEGORIES.includes(input.category)) {
        await tx.studentVerification.create({
          data: {
            registrationId: createdRegistration.id,

            studentIdNumber: input.studentIdNumber!,

            institutionName: input.studentInstitutionName!,

            studentIdFront: input.studentIdFront!,

            studentIdBack: input.studentIdBack!,

            verificationStatus:
              StudentVerificationStatus.PENDING,

            rejectionReason: "",
          },
        });
      }

      return createdRegistration;
    });

    await auditService.log({
      action: AuditAction.REGISTER,
      entity: "Registration",
      entityId: registration.id,
      newValue: {
        registrationCode: registration.registrationCode,
        fullName: registration.fullName,
        email: registration.email,
        category: registration.category,
        registrationStatus: registration.registrationStatus,
        paymentStatus: registration.paymentStatus,
      },
    });

    return toRegistrationDto(registration);
  }

async verifyRegistration(
  input: VerifyRegistrationInput
): Promise<RegistrationVerificationDto> {
  const registration =
    await db.registration.findFirst({
      where: {
        registrationCode: input.registrationCode,

        email: input.email.toLowerCase(),
      },

      include: this.registrationInclude,
    });

  if (!registration) {
    throw new RegistrationNotFoundError();
  }

  return toRegistrationVerificationDto(
    registration
  );
}

  async getRegistrationByCode(
    registrationCode: string
  ): Promise<RegistrationDetailsDto> {
    const registration = await db.registration.findUnique({
      where: {
        registrationCode,
      },
      include: this.registrationInclude,
    });

    if (!registration) {
      throw new RegistrationNotFoundError();
    }

    return toRegistrationDetailsDto(registration);
  }

  async getRegistrationByEmail(
    email: string
  ): Promise<RegistrationDetailsDto> {
    const registration = await db.registration.findUnique({
      where: {
        email,
      },
      include: this.registrationInclude,
    });

    if (!registration) {
      throw new RegistrationNotFoundError();
    }

    return toRegistrationDetailsDto(registration);
  }

async getRegistrationById(
  registrationId: string
): Promise<RegistrationDetailsDto> {
  const registration =
    await db.registration.findUnique({
      where: {
        id: registrationId,
      },
      include: this.registrationInclude,
    });

  if (!registration) {
    throw new RegistrationNotFoundError();
  }

  return toRegistrationDetailsDto(
    registration
  );
}

  async listRegistrations(
  query: RegistrationListQuery
): Promise<PaginatedRegistrationDto<RegistrationDto>> {
  const {
    page,
    pageSize,
    search,
    category,
    registrationStatus,
    paymentStatus,
  } = query;

  const where: Prisma.RegistrationWhereInput = {
    ...(category && { category }),

    ...(registrationStatus && {
      registrationStatus,
    }),

    ...(paymentStatus && {
      paymentStatus,
    }),

    ...(search && {
      OR: [
        {
          fullName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          registrationCode: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    }),
  };

  const [registrations, totalItems] =
    await db.$transaction([
      db.registration.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),

      db.registration.count({
        where,
      }),
    ]);

  return {
    items: registrations.map(toRegistrationDto),

    pagination: {
      page,
      pageSize,

      totalItems,

      totalPages: Math.ceil(
        totalItems / pageSize
      ),
    },
  };
}

  private async validateConferenceState() {
    const settings = await db.setting.findFirst();

    if (!settings) {
      throw new ConferenceConfigurationError(
        "Conference settings have not been configured."
      );
    }

    if (settings.maintenanceMode) {
      throw new RegistrationClosedError();
    }

    if (!settings.registrationOpen) {
      throw new RegistrationClosedError();
    }

    return settings;
  }


  private calculateRegistrationFee(
    category: RegistrationCategory,
    settings: Awaited<
      ReturnType<RegistrationService["validateConferenceState"]>
    >
  ): {
    amount: Prisma.Decimal;
    currency: string;
  } {
    switch (category) {
      case RegistrationCategory.EARLY_BIRD:
        return {
          amount: settings.earlyBirdFee,
          currency: "NGN",
        };

      case RegistrationCategory.REGULAR:
        return {
          amount: settings.regularFee,
          currency: "NGN",
        };

      case RegistrationCategory.STUDENT_EARLY_BIRD:
        return {
          amount: settings.studentEarlyBirdFee,
          currency: "NGN",
        };

      case RegistrationCategory.STUDENT_REGULAR:
        return {
          amount: settings.studentRegularFee,
          currency: "NGN",
        };

      case RegistrationCategory.INTERNATIONAL:
        return {
          amount: settings.internationalFee,
          currency: settings.internationalCurrency,
        };

      default:
        throw new ConferenceConfigurationError(
          "Unsupported registration category."
        );
    }
  }

  private readonly registrationInclude =
    Prisma.validator<Prisma.RegistrationInclude>()({
      studentVerification: true,
      payments: true,
      qrCode: true,
    });

  private async generateRegistrationCode(
    year: number
  ): Promise<string> {
    while (true) {
      const random = randomBytes(3).toString("hex").toUpperCase();

      const code = `${REGISTRATION_CODE_PREFIX}-${year}-${random}`;

      const exists = await db.registration.findUnique({
        where: {
          registrationCode: code,
        },
        select: {
          id: true,
        },
      });

      if (!exists) {
        return code;
      }
    }
  }

  private async ensureUniqueEmail(
    email: string
  ): Promise<void> {
    const registration =
      await db.registration.findUnique({
        where: {
          email,
        },
        select: {
          id: true,
        },
      });

    if (registration) {
      throw new DuplicateRegistrationError();
    }
  }

  async confirmRegistration(
    registrationId: string
  ): Promise<RegistrationDetailsDto> {
    const registration = await db.registration.findUnique({
      where: {
        id: registrationId,
      },
    });

    if (!registration) {
      throw new RegistrationNotFoundError();
    }

    if (
      registration.registrationStatus ===
      RegistrationStatus.CONFIRMED
    ) {
      return this.getRegistrationByCode(
        registration.registrationCode
      );
    }

    await db.registration.update({
      where: {
        id: registrationId,
      },
      data: {
        registrationStatus:
          RegistrationStatus.CONFIRMED,
      },
    });

    return this.getRegistrationByCode(
      registration.registrationCode
    );
  }

  async cancelRegistration(
    registrationId: string
  ): Promise<RegistrationDetailsDto> {
    const registration = await db.registration.findUnique({
      where: {
        id: registrationId,
      },
    });

    if (!registration) {
      throw new RegistrationNotFoundError();
    }

    if (
      registration.registrationStatus ===
      RegistrationStatus.CANCELLED
    ) {
      return this.getRegistrationByCode(
        registration.registrationCode
      );
    }

    await db.registration.update({
      where: {
        id: registrationId,
      },
      data: {
        registrationStatus:
          RegistrationStatus.CANCELLED,
      },
    });

    return this.getRegistrationByCode(
      registration.registrationCode
    );
  }
}


export const registrationService =
  new RegistrationService();