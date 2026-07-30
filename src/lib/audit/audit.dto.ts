import { AuditAction, AuditLog } from "@prisma/client";

import {
  AuditEntity,
  AuditPaginationResult,
} from "./audit.type";

export interface AuditLogDto {
  id: string;

  adminId: string | null;

  action: AuditAction;

  entity: AuditEntity;

  entityId: string;

  oldValue: unknown;

  newValue: unknown;

  ipAddress: string | null;

  userAgent: string | null;

  createdAt: string;
}

export interface AuditLogDetailsDto extends AuditLogDto {}

export interface AuditLogListDto
  extends AuditPaginationResult<AuditLogDto> {}


export function toAuditLogDto(
  audit: AuditLog
): AuditLogDto {
  return {
    id: audit.id,

    adminId: audit.adminId,

    action: audit.action as AuditAction,

    entity: audit.entity as AuditEntity,

    entityId: audit.entityId,

    oldValue: audit.oldValue,

    newValue: audit.newValue,

    ipAddress: audit.ipAddress,

    userAgent: audit.userAgent,

    createdAt: audit.createdAt.toISOString(),
  };
}

export function toAuditLogDetailsDto(
  audit: AuditLog
): AuditLogDetailsDto {
  return toAuditLogDto(audit);
}

export function toAuditLogListDto(
  audits: AuditLog[],
  total: number,
  page: number,
  pageSize: number
): AuditLogListDto {
  return {
    items: audits.map(toAuditLogDto),

    total,

    page,

    pageSize,

    totalPages: Math.ceil(total / pageSize),
  };
}