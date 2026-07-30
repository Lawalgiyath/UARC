import type { Prisma, Setting } from "@prisma/client";

export interface ConferenceSettingsDto {
  id: string;

  conferenceName: string;
  conferenceYear: number;

  conferencePhase?: string;

  abstractSubmissionOpen: boolean;
  registrationOpen: boolean;

  abstractDeadline: string;
  earlyBirdDeadline: string;
  regularDeadline: string;

  conferenceStartDate: string;
  conferenceEndDate: string;

  registrationFees: {
    earlyBird: number;
    regular: number;
    studentEarlyBird: number;
    studentRegular: number;
    international: number;
    internationalCurrency: string;
  };

  abstract: {
    minWords: number;
    maxWords: number;
    maxUploadSizeMB: number;
  };

  maintenanceMode: boolean;

  updatedAt: string;
}

export interface ConferenceSettingsResponseDto {
  success: true;
  data: ConferenceSettingsDto;
}

export interface SuccessResponseDto {
  success: true;
  message: string;
}

export interface ErrorResponseDto {
  success: false;
  message: string;
  errors?: unknown;
}

function decimalToNumber(
  value: Prisma.Decimal | number | string
): number {
  return Number(value);
}

export function toConferenceSettingsDto(
  setting: Setting & {
    conferencePhase?: string;
  }
): ConferenceSettingsDto {
  return {
    id: setting.id,

    conferenceName: setting.conferenceName,
    conferenceYear: setting.conferenceYear,

    conferencePhase: setting.conferencePhase,

    abstractSubmissionOpen: setting.abstractSubmissionOpen,
    registrationOpen: setting.registrationOpen,

    abstractDeadline: setting.abstractDeadline.toISOString(),
    earlyBirdDeadline: setting.earlyBirdDeadline.toISOString(),
    regularDeadline: setting.regularDeadline.toISOString(),

    conferenceStartDate: setting.conferenceStartDate.toISOString(),
    conferenceEndDate: setting.conferenceEndDate.toISOString(),

    registrationFees: {
      earlyBird: decimalToNumber(setting.earlyBirdFee),
      regular: decimalToNumber(setting.regularFee),
      studentEarlyBird: decimalToNumber(setting.studentEarlyBirdFee),
      studentRegular: decimalToNumber(setting.studentRegularFee),
      international: decimalToNumber(setting.internationalFee),
      internationalCurrency: setting.internationalCurrency,
    },

    abstract: {
      minWords: setting.minAbstractWords,
      maxWords: setting.maxAbstractWords,
      maxUploadSizeMB: setting.maxUploadSizeMB,
    },

    maintenanceMode: setting.maintenanceMode,

    updatedAt: setting.updatedAt.toISOString(),
  };
}

export function toConferenceSettingsResponseDto(
  setting: Setting & {
    conferencePhase?: string;
  }
): ConferenceSettingsResponseDto {
  return {
    success: true,
    data: toConferenceSettingsDto(setting),
  };
}