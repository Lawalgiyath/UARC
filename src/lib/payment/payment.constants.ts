import {
  PaymentGateway,
  PaymentStatus,
} from "@prisma/client";

import type {
  TranzgateChannel,
  TranzgateCurrency,
} from "./tranzgate.types";


export const DEFAULT_CURRENCY: TranzgateCurrency =
  "Naira";

export const DEFAULT_PAYMENT_GATEWAY: PaymentGateway =
  PaymentGateway.TRANZGATE;

export const DEFAULT_PAYMENT_STATUS: PaymentStatus =
  PaymentStatus.PENDING;

export const PAYMENT_REFERENCE_PREFIX =
  "UARC";

export const PAYMENT_SESSION_PREFIX =
  "SESSION";

export const PAYMENT_DOCUMENT_PREFIX =
  "PAY";

export const DEFAULT_PAYMENT_CHANNEL: TranzgateChannel =
  "RemitaOnline";

export const PAYMENT_MAX_RETRIES = 3;

export const PAYMENT_RETRY_DELAY_MS = 2_000;

export const PAYMENT_SEARCH_PAGE = 1;

export const PAYMENT_SEARCH_PAGE_SIZE = 1;

export const TRANZGATE_REQUEST_TIMEOUT_MS =
  30_000;

export const TRANZGATE_CONNECT_TIMEOUT_MS =
  10_000;

export const WEBHOOK_SIGNATURE_HEADER =
  "x-tranzgate-signature";

export const PAYMENT_METADATA_KEYS = {
  registrationId: "registrationId",
  registrationCode: "registrationCode",
  paymentBatchId: "paymentBatchId",
  gatewayReference: "gatewayReference",
} as const;