import {
    AuditAction,
    AdminRole,
    Prisma,
    Setting,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

import {
    ConferenceSettingsDto,
    toConferenceSettingsDto,
} from "./settings.dto";

import { UpdateConferenceSettingsInput } from "./settings.validation";

export abstract class SettingsServiceError extends Error {
    readonly statusCode: number;
    readonly code: string;

    protected constructor(
        message: string,
        statusCode: number,
        code: string
    ) {
        super(message);

        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.code = code;

        Error.captureStackTrace?.(this, this.constructor);
    }
}

export class SettingsNotFoundError extends SettingsServiceError {
    constructor() {
        super(
            "Conference settings were not found.",
            404,
            "SETTINGS_NOT_FOUND"
        );
    }
}

export class SettingsPermissionError extends SettingsServiceError {
    constructor() {
        super(
            "You do not have permission to update conference settings.",
            403,
            "SETTINGS_PERMISSION_DENIED"
        );
    }
}

export class SettingsValidationError extends SettingsServiceError {
    constructor(message: string) {
        super(
            message,
            400,
            "SETTINGS_VALIDATION_FAILED"
        );
    }
}

export class SettingsDatabaseError extends SettingsServiceError {
    constructor() {
        super(
            "Unable to complete the requested operation.",
            500,
            "DATABASE_ERROR"
        );
    }
}

export interface SettingsActor {
    id: string;
    role: AdminRole;
    ipAddress?: string;
    userAgent?: string;
}

export class ConferenceSettingsService {

    private static readonly SETTINGS_ID = "conference-settings";

    constructor() { }

    async getSettings(): Promise<ConferenceSettingsDto> {
        try {
            const settings = await prisma.setting.findUnique({
                where: {
                    id: ConferenceSettingsService.SETTINGS_ID,
                },
            });

            if (!settings) {
                throw new SettingsNotFoundError();
            }

            return toConferenceSettingsDto(settings);
        } catch (error) {
            if (error instanceof SettingsServiceError) {
                throw error;
            }

            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                throw new SettingsDatabaseError();
            }

            if (error instanceof Prisma.PrismaClientUnknownRequestError) {
                throw new SettingsDatabaseError();
            }

            throw error;
        }
    }

    private ensureAuthorized(actor: SettingsActor): void {
        const allowedRoles: AdminRole[] = [
            AdminRole.SUPER_ADMIN,
            AdminRole.SECRETARIAT,
        ];

        if (!allowedRoles.includes(actor.role)) {
            throw new SettingsPermissionError();
        }
    }

    private async createAuditLog(
        tx: Prisma.TransactionClient,
        params: {
            actor: SettingsActor;
            entityId: string;
            oldValue: Prisma.JsonObject;
            newValue: Prisma.JsonObject;
        }
    ): Promise<void> {
        await tx.auditLog.create({
            data: {
                adminId: params.actor.id,
                action: AuditAction.UPDATE_SETTINGS,
                entity: "Setting",
                entityId: params.entityId,

                oldValue: params.oldValue,
                newValue: params.newValue,

                ipAddress: params.actor.ipAddress,
                userAgent: params.actor.userAgent,
            },
        });
    }

    private serializeSetting(setting: Setting): Prisma.JsonObject {
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

            earlyBirdFee: Number(setting.earlyBirdFee),
            regularFee: Number(setting.regularFee),
            studentEarlyBirdFee: Number(setting.studentEarlyBirdFee),
            studentRegularFee: Number(setting.studentRegularFee),
            internationalFee: Number(setting.internationalFee),

            internationalCurrency: setting.internationalCurrency,

            minAbstractWords: setting.minAbstractWords,
            maxAbstractWords: setting.maxAbstractWords,

            maxUploadSizeMB: setting.maxUploadSizeMB,

            maintenanceMode: setting.maintenanceMode,

            updatedAt: setting.updatedAt.toISOString(),
        };
    }

    private validateBusinessRules(
        current: Setting,
        payload: UpdateConferenceSettingsInput
    ): void {

        if (
            payload.conferenceYear &&
            payload.conferenceYear < current.conferenceYear
        ) {
            throw new SettingsValidationError(
                "Conference year cannot be decreased."
            );
        }

        if (
            payload.conferenceStartDate &&
            payload.conferenceEndDate &&
            payload.conferenceEndDate < payload.conferenceStartDate
        ) {
            throw new SettingsValidationError(
                "Conference end date must be after the start date."
            );
        }

        if (
            payload.minAbstractWords &&
            payload.maxAbstractWords &&
            payload.minAbstractWords >= payload.maxAbstractWords
        ) {
            throw new SettingsValidationError(
                "Minimum abstract words must be less than maximum abstract words."
            );
        }

        if (
            payload.maxUploadSizeMB &&
            payload.maxUploadSizeMB <= 0
        ) {
            throw new SettingsValidationError(
                "Maximum upload size must be greater than zero."
            );
        }
    }

    async updateSettings(
        actor: SettingsActor,
        payload: UpdateConferenceSettingsInput
    ): Promise<ConferenceSettingsDto> {
        this.ensureAuthorized(actor);

        try {
            const updatedSetting = await prisma.$transaction(async (tx) => {
                const current = await tx.setting.findUnique({
                    where: {
                        id: ConferenceSettingsService.SETTINGS_ID,
                    },
                });

                if (!current) {
                    throw new SettingsNotFoundError();
                }

                this.validateBusinessRules(current, payload);

                const updated = await tx.setting.update({
                    where: {
                        id: current.id,
                    },
                    data: payload,
                });

                await this.createAuditLog(tx, {
                    actor,
                    entityId: updated.id,
                    oldValue: this.serializeSetting(current),
                    newValue: this.serializeSetting(updated),
                });

                return updated;
            });

            return toConferenceSettingsDto(updatedSetting);
        } catch (error) {
            if (error instanceof SettingsServiceError) {
                throw error;
            }

            if (
                error instanceof Prisma.PrismaClientKnownRequestError ||
                error instanceof Prisma.PrismaClientUnknownRequestError
            ) {
                throw new SettingsDatabaseError();
            }

            throw error;
        }
    }
}

export const settingsService = new ConferenceSettingsService();
