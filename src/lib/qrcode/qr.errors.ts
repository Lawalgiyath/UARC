export type QRCodeErrorCode =
  | "QR_NOT_FOUND"
  | "QR_ALREADY_EXISTS"
  | "QR_ALREADY_GENERATED"
  | "QR_GENERATION_FAILED"
  | "QR_STORAGE_FAILED"
  | "QR_INVALID"
  | "QR_EXPIRED"
  | "QR_ALREADY_SCANNED"
  | "QR_SCAN_FAILED"
  | "QR_VERIFICATION_FAILED"
  | "QR_CONFIGURATION_ERROR"
  | "INVALID_QR_TOKEN"
  | "REGISTRATION_NOT_FOUND";

export class QRCodeServiceError extends Error {
  readonly code: QRCodeErrorCode;

  readonly statusCode: number;

  override readonly cause?: unknown;

  constructor(options: {
    code: QRCodeErrorCode;
    message: string;
    statusCode: number;
    cause?: unknown;
  }) {
    super(options.message);

    this.name = "QRCodeServiceError";

    this.code = options.code;

    this.statusCode = options.statusCode;

    this.cause = options.cause;

    Object.setPrototypeOf(
      this,
      QRCodeServiceError.prototype
    );

    Error.captureStackTrace?.(
      this,
      QRCodeServiceError
    );
  }
}

function createError(options: {
  code: QRCodeErrorCode;
  message: string;
  statusCode: number;
  cause?: unknown;
}): never {
  throw new QRCodeServiceError(options);
}

export const qrErrors = Object.freeze({
  registrationNotFound(
    registrationId: string
  ): never {
    return createError({
      code: "REGISTRATION_NOT_FOUND",
      message: `Registration '${registrationId}' was not found.`,
      statusCode: 404,
    });
  },

  qrNotFound(
    registrationId: string
  ): never {
    return createError({
      code: "QR_NOT_FOUND",
      message: `QR code for registration '${registrationId}' was not found.`,
      statusCode: 404,
    });
  },

  qrAlreadyExists(
    registrationId: string
  ): never {
    return createError({
      code: "QR_ALREADY_EXISTS",
      message: `QR code already exists for registration '${registrationId}'.`,
      statusCode: 409,
    });
  },

  qrAlreadyGenerated(
    registrationCode: string
  ): never {
    return createError({
      code: "QR_ALREADY_GENERATED",
      message: `QR code has already been generated for '${registrationCode}'.`,
      statusCode: 409,
    });
  },

  invalidQrToken(
    token: string
  ): never {
    return createError({
      code: "INVALID_QR_TOKEN",
      message: `QR token '${token}' is invalid.`,
      statusCode: 400,
    });
  },

  qrExpired(): never {
    return createError({
      code: "QR_EXPIRED",
      message: "The QR code has expired.",
      statusCode: 410,
    });
  },

  qrAlreadyScanned(
    registrationCode: string
  ): never {
    return createError({
      code: "QR_ALREADY_SCANNED",
      message: `QR code for '${registrationCode}' has already been scanned.`,
      statusCode: 409,
    });
  },

  generationFailed(
    message: string,
    cause?: unknown
  ): never {
    return createError({
      code: "QR_GENERATION_FAILED",
      message,
      statusCode: 500,
      cause,
    });
  },

  storageFailed(
    message: string,
    cause?: unknown
  ): never {
    return createError({
      code: "QR_STORAGE_FAILED",
      message,
      statusCode: 500,
      cause,
    });
  },

  scanFailed(
    message: string,
    cause?: unknown
  ): never {
    return createError({
      code: "QR_SCAN_FAILED",
      message,
      statusCode: 500,
      cause,
    });
  },

  verificationFailed(
    message: string,
    cause?: unknown
  ): never {
    return createError({
      code: "QR_VERIFICATION_FAILED",
      message,
      statusCode: 500,
      cause,
    });
  },

  configurationError(
    message: string
  ): never {
    return createError({
      code: "QR_CONFIGURATION_ERROR",
      message,
      statusCode: 500,
    });
  },
} as const);