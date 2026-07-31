import { Attendance, Prisma, Registration } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { qrService } from "@/lib/qrcode/qr.service";
import { attendanceErrors } from "./attendance.errors";
import type { AttendanceQueryInput, CheckInInput, CheckOutInput } from "./attendance.validation";

export interface AttendanceStatistics {
    totalRegistrations: number;
    totalAttendances: number;
    currentlyCheckedIn: number;
    completedAttendances: number;
    attendanceRate: number;
    checkedOutRate: number;
}

export class AttendanceService {
    constructor(
        private readonly db: Prisma.TransactionClient | typeof prisma = prisma
    ) { }

    private async getAttendanceById(attendanceId: string): Promise<Attendance | null> {
        return this.db.attendance.findUnique({
            where: { id: attendanceId },
        });
    }

    private async getActiveAttendance(registrationId: string): Promise<Attendance | null> {
        return this.db.attendance.findFirst({
            where: {
                registrationId,
                checkInTime: { not: null },
                checkOutTime: null,
            },
            orderBy: { createdAt: "desc" },
        });
    }

    private async createAttendance(
        registration: Registration,
        qrCodeId: string,
        options?: {
            checkedInBy?: string;
            location?: string;
        }
    ): Promise<Attendance> {
        try {
            return await this.db.attendance.create({
                data: {
                    registrationId: registration.id,
                    qrCodeId,
                    checkInTime: new Date(),
                    checkedInBy: options?.checkedInBy,
                    location: options?.location,
                },
            });
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            throw attendanceErrors.creationFailed(registration.registrationCode, msg);
        }
    }

    private async updateAttendance(
        attendanceId: string,
        data: Prisma.AttendanceUpdateInput,
        registrationCode: string
    ): Promise<Attendance> {
        try {
            return await this.db.attendance.update({
                where: { id: attendanceId },
                data,
            });
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            throw attendanceErrors.updateFailed(registrationCode, msg);
        }
    }

    async checkIn(input: CheckInInput): Promise<{
        attendance: Attendance;
        registration: Registration;
    }> {
        const { qr, registration } = await qrService.validateQrToken(input.qrToken);

        const activeAttendance = await this.getActiveAttendance(registration.id);

        if (activeAttendance) {
            throw attendanceErrors.alreadyCheckedIn(registration.registrationCode);
        }

        const attendance = await this.createAttendance(registration, qr.id, {
            checkedInBy: input.checkedInBy,
            location: input.location,
        });

        return {
            attendance,
            registration,
        };
    }

    async checkOut(input: CheckOutInput): Promise<Attendance> {
        const { registration } = await qrService.validateQrToken(input.qrToken);

        const attendance = await this.getActiveAttendance(registration.id);

        if (!attendance) {
            throw attendanceErrors.notCheckedIn(registration.registrationCode);
        }

        if (attendance.checkOutTime) {
            throw attendanceErrors.alreadyCheckedOut(registration.registrationCode);
        }

        return this.updateAttendance(
            attendance.id,
            {
                checkOutTime: new Date(),
                checkedOutBy: input.checkedOutBy,
            },
            registration.registrationCode
        );
    }

    async getAttendance(attendanceId: string): Promise<Attendance> {
        const attendance = await this.getAttendanceById(attendanceId);

        if (!attendance) {
            throw attendanceErrors.attendanceNotFound(attendanceId);
        }

        return attendance;
    }

    async getAttendanceHistory(input?: AttendanceQueryInput): Promise<Attendance[]> {
        return this.db.attendance.findMany({
            where: {
                registrationId: input?.registrationId,
                checkInTime: input?.checkedIn ? { not: null } : undefined,
                checkOutTime: input?.checkedOut ? { not: null } : undefined,
            },
            include: {
                registration: true,
                qrCode: true,
            },
            orderBy: { createdAt: "desc" },
        });
    }

    async getAttendanceStatistics(): Promise<AttendanceStatistics> {
        const [
            totalRegistrations,
            totalAttendances,
            currentlyCheckedIn,
            completedAttendances,
        ] = await Promise.all([
            this.db.registration.count(),

            this.db.attendance.count(),

            this.db.attendance.count({
                where: {
                    checkInTime: {
                        not: null,
                    },
                    checkOutTime: null,
                },
            }),

            this.db.attendance.count({
                where: {
                    checkOutTime: {
                        not: null,
                    },
                },
            }),
        ]);

        const attendanceRate =
            totalRegistrations === 0
                ? 0
                : Number(
                    (
                        (totalAttendances /
                            totalRegistrations) *
                        100
                    ).toFixed(2)
                );

        const checkedOutRate =
            totalAttendances === 0
                ? 0
                : Number(
                    (
                        (completedAttendances /
                            totalAttendances) *
                        100
                    ).toFixed(2)
                );

        return {
            totalRegistrations,
            totalAttendances,
            currentlyCheckedIn,
            completedAttendances,
            attendanceRate,
            checkedOutRate,
        };
    }

    async exportAttendance(input?: AttendanceQueryInput): Promise<
        Array<{
            registrationCode: string;
            fullName: string;
            email: string;
            institution: string;
            category: string;
            checkInTime: Date | null;
            checkOutTime: Date | null;
            checkedInBy: string | null;
            checkedOutBy: string | null;
            location: string | null;
        }>
    > {
        const attendances = await this.db.attendance.findMany({
            where: {
                registrationId: input?.registrationId,
                checkInTime: input?.checkedIn ? { not: null } : undefined,
                checkOutTime: input?.checkedOut ? { not: null } : undefined,
            },
            include: {
                registration: true,
            },
            orderBy: { createdAt: "asc" },
        });

        return attendances.map((attendance) => {
            if (!attendance.registration) {
                throw new Error(`Data Mismatch: Attendance record ${attendance.id} lacks a linked registration profile.`);
            }

            return {
                registrationCode: attendance.registration.registrationCode,
                fullName: attendance.registration.fullName,
                email: attendance.registration.email,
                institution: attendance.registration.institution,
                category: attendance.registration.category,
                checkInTime: attendance.checkInTime,
                checkOutTime: attendance.checkOutTime,
                checkedInBy: attendance.checkedInBy,
                checkedOutBy: attendance.checkedOutBy,
                location: attendance.location,
            };
        });
    }
}

export const attendanceService = new AttendanceService();
