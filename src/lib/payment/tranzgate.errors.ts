export enum TranzgateErrorCode {
  CONFIGURATION_ERROR = "CONFIGURATION_ERROR",

  AUTHENTICATION_FAILED = "AUTHENTICATION_FAILED",

  INVALID_REQUEST = "INVALID_REQUEST",

  PAYMENT_NOT_FOUND = "PAYMENT_NOT_FOUND",

  PAYMENT_REJECTED = "PAYMENT_REJECTED",

  PAYMENT_PENDING = "PAYMENT_PENDING",

  INVALID_RESPONSE = "INVALID_RESPONSE",

  SOAP_REQUEST_FAILED = "SOAP_REQUEST_FAILED",

  NETWORK_ERROR = "NETWORK_ERROR",

  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",

  TIMEOUT = "TIMEOUT",

  INTERNAL_ERROR = "INTERNAL_ERROR",
}

const STATUS_MAP: Record<
  TranzgateErrorCode,
  number
> = {
  [TranzgateErrorCode.CONFIGURATION_ERROR]: 500,

  [TranzgateErrorCode.AUTHENTICATION_FAILED]: 401,

  [TranzgateErrorCode.INVALID_REQUEST]: 400,

  [TranzgateErrorCode.PAYMENT_NOT_FOUND]: 404,

  [TranzgateErrorCode.PAYMENT_REJECTED]: 422,

  [TranzgateErrorCode.PAYMENT_PENDING]: 409,

  [TranzgateErrorCode.INVALID_RESPONSE]: 502,

  [TranzgateErrorCode.SOAP_REQUEST_FAILED]: 502,

  [TranzgateErrorCode.NETWORK_ERROR]: 503,

  [TranzgateErrorCode.SERVICE_UNAVAILABLE]: 503,

  [TranzgateErrorCode.TIMEOUT]: 504,

  [TranzgateErrorCode.INTERNAL_ERROR]: 500,
};

const RETRYABLE_ERRORS = new Set<
  TranzgateErrorCode
>([
  TranzgateErrorCode.NETWORK_ERROR,

  TranzgateErrorCode.TIMEOUT,

  TranzgateErrorCode.SERVICE_UNAVAILABLE,

  TranzgateErrorCode.SOAP_REQUEST_FAILED,
]);

export class TranzgateError extends Error {
  readonly code: TranzgateErrorCode;

  readonly statusCode: number;

  readonly retryable: boolean;

  readonly details?: unknown;

  readonly cause?: unknown;

  constructor(options: {
    code: TranzgateErrorCode;

    message: string;

    details?: unknown;

    cause?: unknown;
  }) {
    super(options.message);

    this.name = "TranzgateError";

    this.code = options.code;

    this.statusCode =
      STATUS_MAP[options.code];

    this.retryable =
      RETRYABLE_ERRORS.has(options.code);

    this.details = options.details;

    this.cause = options.cause;

    Object.setPrototypeOf(
      this,
      new.target.prototype
    );

    Error.captureStackTrace?.(
      this,
      TranzgateError
    );
  }
}

export const tranzgateErrors = {
  configuration(message: string) {
    return new TranzgateError({
      code:
        TranzgateErrorCode.CONFIGURATION_ERROR,
      message,
    });
  },

  authentication(message: string) {
    return new TranzgateError({
      code:
        TranzgateErrorCode.AUTHENTICATION_FAILED,
      message,
    });
  },

  invalidRequest(
    message: string,
    details?: unknown
  ) {
    return new TranzgateError({
      code:
        TranzgateErrorCode.INVALID_REQUEST,
      message,
      details,
    });
  },

  paymentRejected(
    message: string,
    details?: unknown
  ) {
    return new TranzgateError({
      code:
        TranzgateErrorCode.PAYMENT_REJECTED,
      message,
      details,
    });
  },

  paymentPending(
    message: string,
    details?: unknown
  ) {
    return new TranzgateError({
      code:
        TranzgateErrorCode.PAYMENT_PENDING,
      message,
      details,
    });
  },

  paymentNotFound(
    message: string
  ) {
    return new TranzgateError({
      code:
        TranzgateErrorCode.PAYMENT_NOT_FOUND,
      message,
    });
  },

  invalidResponse(
    message: string,
    details?: unknown
  ) {
    return new TranzgateError({
      code:
        TranzgateErrorCode.INVALID_RESPONSE,
      message,
      details,
    });
  },

  soapFailure(
    message: string,
    cause?: unknown
  ) {
    return new TranzgateError({
      code:
        TranzgateErrorCode.SOAP_REQUEST_FAILED,
      message,
      cause,
    });
  },

  network(
    message: string,
    cause?: unknown
  ) {
    return new TranzgateError({
      code:
        TranzgateErrorCode.NETWORK_ERROR,
      message,
      cause,
    });
  },

  timeout(
    message: string,
    cause?: unknown
  ) {
    return new TranzgateError({
      code:
        TranzgateErrorCode.TIMEOUT,
      message,
      cause,
    });
  },

  unavailable(
    message: string,
    cause?: unknown
  ) {
    return new TranzgateError({
      code:
        TranzgateErrorCode.SERVICE_UNAVAILABLE,
      message,
      cause,
    });
  },

  internal(
    message: string,
    cause?: unknown
  ) {
    return new TranzgateError({
      code:
        TranzgateErrorCode.INTERNAL_ERROR,
      message,
      cause,
    });
  },
};