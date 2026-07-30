import { AuditAction } from "@prisma/client";

export type JsonPrimitive =
    | string
    | number
    | boolean
    | null;

export type JsonValue =
    | JsonPrimitive
    | JsonValue[]
    | {
        [key: string]: JsonValue;
    };


export type AuditEntity =
    | "Setting"
    | "Registration"
    | "StudentVerification"
    | "Payment"
    | "Submission"
    | "Manuscript"
    | "ReviewerAssignment"
    | "Review"
    | "Attendance"
    | "Notification"
    | "QRCode"
    | "Admin";


export interface AuditRequestContext {
    ipAddress?: string | null;

    userAgent?: string | null;
}


export interface AuditLogInput
    extends AuditRequestContext {
    adminId?: string | null;
    action: AuditAction;
    entity: AuditEntity;
    entityId: string;
    oldValue?: JsonValue;
    newValue?: JsonValue;
}

export interface AuditLogFilter {
    adminId?: string;

    entity?: AuditEntity;

    action?: AuditAction;

    from?: Date;

    to?: Date;

    page?: number;

    pageSize?: number;
}

export interface AuditPaginationResult<T> {
    items: T[];

    total: number;

    page: number;

    pageSize: number;

    totalPages: number;
}