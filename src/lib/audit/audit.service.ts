import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";

import { AuditLogDto, toAuditLogDto, toAuditLogListDto, AuditLogListDto } from "./audit.dto";
import { AuditLogInput, AuditLogFilter } from "./audit.type";

export class AuditServiceError extends Error {
    constructor(
        message: string,
        public readonly statusCode = 500,
        public readonly code = "AUDIT_ERROR"
    ) {
        super(message);

        this.name = "AuditServiceError";
    }
}

export class AuditLogNotFoundError extends AuditServiceError {
    constructor() {
        super(
            "Audit log was not found.",
            404,
            "AUDIT_LOG_NOT_FOUND"
        );
    }
}

export class AuditService {

    async log(
        input: AuditLogInput
    ): Promise<AuditLogDto> {
        try {
            const audit = await db.auditLog.create({
                data: {
                    adminId: input.adminId ?? null,

                    action: input.action,

                    entity: input.entity,

                    entityId: input.entityId,

                    oldValue:
                        (input.oldValue as Prisma.InputJsonValue | undefined) ??
                        Prisma.JsonNull,

                    newValue:
                        (input.newValue as Prisma.InputJsonValue | undefined) ??
                        Prisma.JsonNull,

                    ipAddress: input.ipAddress ?? null,

                    userAgent: input.userAgent ?? null,
                },
            });

            return toAuditLogDto(audit);
        } catch (error) {
            this.handleDatabaseError(error);
        }
    }

    async getLog(
        id: string
    ): Promise<AuditLogDto> {
        try {
            const audit = await db.auditLog.findUnique({
                where: {
                    id,
                },
            });

            if (!audit) {
                throw new AuditLogNotFoundError();
            }

            return toAuditLogDto(audit);
        } catch (error) {
            this.handleDatabaseError(error);
        }
    }

    async listLogs(
        filter: AuditLogFilter = {}
    ): Promise<AuditLogListDto> {
        try {
            const page = this.normalizePage(filter.page);
            const pageSize = this.normalizePageSize(
                filter.pageSize
            );

            const where = this.buildWhereClause(filter);

            const [logs, total] = await db.$transaction([
                db.auditLog.findMany({
                    where,

                    orderBy: {
                        createdAt: "desc",
                    },

                    skip: (page - 1) * pageSize,

                    take: pageSize,
                }),

                db.auditLog.count({
                    where,
                }),
            ]);

            return toAuditLogListDto(
                logs,
                total,
                page,
                pageSize
            );
        } catch (error) {
            this.handleDatabaseError(error);
        }
    }

    private buildWhereClause(
        filter: AuditLogFilter
    ): Prisma.AuditLogWhereInput {
        const where: Prisma.AuditLogWhereInput = {};

        if (filter.adminId) {
            where.adminId = filter.adminId;
        }

        if (filter.entity) {
            where.entity = filter.entity;
        }

        if (filter.action) {
            where.action = filter.action;
        }

        if (filter.from || filter.to) {
            where.createdAt = {};

            if (filter.from) {
                where.createdAt.gte = filter.from;
            }

            if (filter.to) {
                where.createdAt.lte = filter.to;
            }
        }

        return where;
    }

    private normalizePage(
        page?: number
    ): number {
        if (!page || page < 1) {
            return 1;
        }

        return Math.floor(page);
    }

    private normalizePageSize(
        pageSize?: number
    ): number {
        if (!pageSize || pageSize < 1) {
            return 20;
        }

        return Math.min(
            Math.floor(pageSize),
            100
        );
    }

    private handleDatabaseError(
        error: unknown
    ): never {
        if (error instanceof AuditServiceError) {
            throw error;
        }

        if (
            error instanceof Prisma.PrismaClientKnownRequestError
        ) {
            switch (error.code) {
                case "P2025":
                    throw new AuditLogNotFoundError();
            }
        }

        console.error("[AuditService]", error);

        throw new AuditServiceError(
            "An unexpected audit service error occurred."
        );
    }
}

export const auditService = new AuditService();