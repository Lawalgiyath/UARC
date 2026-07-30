import {
  PaymentStatus,
  RegistrationCategory,
  RegistrationStatus,
} from "@prisma/client";

export interface RegistrationListQuery {
  page: number;
  pageSize: number;

  search?: string;

  category?: RegistrationCategory;

  registrationStatus?: RegistrationStatus;

  paymentStatus?: PaymentStatus;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;

  totalItems: number;
  totalPages: number;
}

export interface PaginatedRegistrationDto<T> {
  items: T[];
  pagination: PaginationMeta;
}