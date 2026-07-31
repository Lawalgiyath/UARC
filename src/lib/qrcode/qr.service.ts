import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import type {Attendance,Prisma,Registration,QRCode as PrismaQRCode} from "@prisma/client";
import { attendanceErrors } from "../attendance/attendance.errors";
import { prisma } from "@/lib/prisma";
import { qrErrors } from "./qr.errors";
import {
    QR_RANDOM_BYTES,
    QR_TOKEN_PREFIX,
    QR_CODE_DIRECTORY,
    QR_CODE_EXPIRY_HOURS,
} from "./qr.constants";
import type { GenerateQrInput, GetQrInput } from "./qr.validation";

export class QrService {
    constructor(
        private readonly db: Prisma.TransactionClient | typeof prisma = prisma
    ) { }

    private generateQrToken(): string {
        return [
            QR_TOKEN_PREFIX,
            crypto.randomBytes(QR_RANDOM_BYTES).toString("hex"),
        ].join("_");
    }

    private async getRegistrationOrThrow(registrationId: string): Promise<Registration> {
        const registration = await this.db.registration.findUnique({
            where: { id: registrationId },
        });

        if (!registration) {
            throw qrErrors.registrationNotFound(registrationId);
        }

        return registration;
    }

    private async getRegistrationByCodeOrThrow(registrationCode: string): Promise<Registration> {
        const registration = await this.db.registration.findUnique({
            where: { registrationCode },
        });

        if (!registration) {
            throw qrErrors.registrationNotFound(registrationCode);
        }

        return registration;
    }

    private async getQrByRegistration(registrationId: string): Promise<PrismaQRCode | null> {
        return this.db.qRCode.findUnique({
            where: { registrationId },
        });
    }

    private async getQrByToken(token: string): Promise<PrismaQRCode | null> {
        return this.db.qRCode.findUnique({
            where: { token },
        });
    }

    private async getQrOrThrow(input: GetQrInput): Promise<PrismaQRCode> {
        let qr: PrismaQRCode | null = null;

        if (input.registrationId) {
            qr = await this.getQrByRegistration(input.registrationId);
        } else if (input.registrationCode) {
            const registration = await this.getRegistrationByCodeOrThrow(input.registrationCode);
            qr = await this.getQrByRegistration(registration.id);
        }

        if (!qr) {
            throw qrErrors.qrNotFound(
                input.registrationId ?? input.registrationCode ?? "unknown"
            );
        }

        return qr;
    }

    private calculateExpiry(): Date {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + QR_CODE_EXPIRY_HOURS);
        return expiresAt;
    }

    private async createQrImage(token: string): Promise<string> {
        const directory = path.join(process.cwd(), "public", QR_CODE_DIRECTORY);
        await fs.mkdir(directory, { recursive: true });

        const filename = `${token}.png`;
        const absolutePath = path.join(directory, filename);
        const relativePath = `/${QR_CODE_DIRECTORY}/${filename}`;

        const payload = JSON.stringify({
            token,
            version: 1,
            type: "conference-registration",
        });

        await QRCode.toFile(absolutePath, payload, {
            type: "png",
            errorCorrectionLevel: "H",
            margin: 2,
            width: 500,
            color: {
                dark: "#000000",
                light: "#FFFFFF",
            },
        });

        return relativePath;
    }

    private async createAttendance(
        registrationId: string,
        qrCodeId: string,
        options?: {
            checkedInBy?: string;
            location?: string;
        }
    ): Promise<Attendance> {
        return this.db.attendance.create({
            data: {
                registrationId,
                qrCodeId,
                checkInTime: new Date(),
                checkedInBy: options?.checkedInBy,
                location: options?.location,
            },
        });
    }


    async generateQr(input: GenerateQrInput): Promise<PrismaQRCode> {
        const registration = await this.getRegistrationOrThrow(input.registrationId);
        const existingQr = await this.getQrByRegistration(registration.id);

        if (existingQr && !input.regenerate) {
            return existingQr;
        }

        if (existingQr && input.regenerate) {
            return this.regenerateQr(input);
        }

        const token = this.generateQrToken();
        const qrImagePath = await this.createQrImage(token);

        try {
            return await this.db.qRCode.create({
                data: {
                    registrationId: registration.id,
                    token,
                    qrImagePath,
                    generatedAt: new Date(),
                    expiresAt: this.calculateExpiry(),
                },
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw qrErrors.generationFailed(message);
        }
    }

    async getQr(input: GetQrInput): Promise<PrismaQRCode> {
        return this.getQrOrThrow(input);
    }

    async regenerateQr(input: GenerateQrInput): Promise<PrismaQRCode> {
        const registration = await this.getRegistrationOrThrow(input.registrationId);
        const existingQr = await this.getQrByRegistration(registration.id);

        if (!existingQr) {
            return this.generateQr({
                registrationId: registration.id,
                regenerate: false,
            });
        }

        const token = this.generateQrToken();
        const qrImagePath = await this.createQrImage(token);

        try {
            return await this.db.qRCode.update({
                where: { id: existingQr.id },
                data: {
                    token,
                    qrImagePath,
                    generatedAt: new Date(),
                    expiresAt: this.calculateExpiry(),
                },
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw qrErrors.generationFailed(message);
        }
    }
async recordAttendance(
    token: string,
    options?: {
        checkedInBy?: string;
        location?: string;
    }
): Promise<{
    attendance: Attendance;
    registration: Registration;
}> {
    const { qr, registration } = await this.validateQrToken(token);

    const existingAttendance = await this.db.attendance.findFirst({
        where: {
            registrationId: registration.id,
            checkInTime: {
                not: null,
            },
            checkOutTime: null,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    if (existingAttendance) {
        throw attendanceErrors.alreadyCheckedIn(registration.registrationCode);
    }

    try {
        const attendance = await this.createAttendance(
            registration.id,
            qr.id,
            options
        );

        return {
            attendance,
            registration,
        };
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        throw attendanceErrors.creationFailed(registration.registrationCode, msg);
    }
}

    async validateQrToken(token: string): Promise<{
        qr: PrismaQRCode;
        registration: Registration;
    }> {
        const qr = await this.getQrByToken(token);

        if (!qr) {
            throw qrErrors.invalidQrToken(token);
        }

        if (qr.expiresAt && qr.expiresAt.getTime() < Date.now()) {
            throw qrErrors.qrExpired();
        }

        const registration = await this.getRegistrationOrThrow(qr.registrationId);

        return {
            qr,
            registration,
        };
    }

    async deleteQr(registrationId: string): Promise<void> {
        const qr = await this.getQrByRegistration(registrationId);

        if (!qr) {
            throw qrErrors.qrNotFound(registrationId);
        }

        await this.db.qRCode.delete({
            where: { id: qr.id },
        });
    }
}

export const qrService = new QrService();
