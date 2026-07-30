export type PaymentErrorCode =
  | "PAYMENT_NOT_FOUND"
  | "REGISTRATION_NOT_FOUND"
  | "PAYMENT_ALREADY_EXISTS"
  | "PAYMENT_ALREADY_COMPLETED"
  | "PAYMENT_ALREADY_CANCELLED"
  | "PAYMENT_NOT_PENDING"
  | "INVALID_PAYMENT_STATUS"
  | "INVALID_WEBHOOK_SIGNATURE"
  | "WEBHOOK_ALREADY_PROCESSED"
  | "PAYMENT_VERIFICATION_FAILED"
  | "PAYMENT_INITIALIZATION_FAILED"
  | "PAYMENT_GATEWAY_ERROR"
  | "PAYMENT_GATEWAY_TIMEOUT"
  | "PAYMENT_DECLINED"
  | "PAYMENT_CONFIGURATION_ERROR";

export class PaymentServiceError extends Error {
  readonly code: PaymentErrorCode;

  readonly statusCode: number;

  override readonly cause?: unknown;

  constructor(options: {
    code: PaymentErrorCode;
    message: string;
    statusCode: number;
    cause?: unknown;
  }) {
    super(options.message);

    this.name = "PaymentServiceError";

    this.code = options.code;

    this.statusCode = options.statusCode;

    this.cause = options.cause;

    Object.setPrototypeOf(
      this,
      PaymentServiceError.prototype
    );

    Error.captureStackTrace?.(
      this,
      PaymentServiceError
    );
  }
}

function createError(options: {
  code: PaymentErrorCode;
  message: string;
  statusCode: number;
  cause?: unknown;
}): never {
  throw new PaymentServiceError(options);
}

export const paymentErrors = Object.freeze({
  registrationNotFound(
    registrationId: string
  ): never {
    return createError({
      code: "REGISTRATION_NOT_FOUND",
      message: `Registration '${registrationId}' was not found.`,
      statusCode: 404,
    });
  },

  paymentNotFound(
    paymentId: string
  ): never {
    return createError({
      code: "PAYMENT_NOT_FOUND",
      message: `Payment '${paymentId}' was not found.`,
      statusCode: 404,
    });
  },

  paymentAlreadyExists(
    transactionReference: string
  ): never {
    return createError({
      code: "PAYMENT_ALREADY_EXISTS",
      message: `Payment '${transactionReference}' already exists.`,
      statusCode: 409,
    });
  },

  paymentAlreadyCompleted(
    transactionReference: string
  ): never {
    return createError({
      code: "PAYMENT_ALREADY_COMPLETED",
      message: `Payment '${transactionReference}' has already been completed.`,
      statusCode: 409,
    });
  },

  paymentAlreadyCancelled(
    transactionReference: string
  ): never {
    return createError({
      code: "PAYMENT_ALREADY_CANCELLED",
      message: `Payment '${transactionReference}' has already been cancelled.`,
      statusCode: 409,
    });
  },

  paymentNotPending(
    status: string
  ): never {
    return createError({
      code: "PAYMENT_NOT_PENDING",
      message: `Expected payment status 'PENDING' but received '${status}'.`,
      statusCode: 409,
    });
  },

  invalidPaymentStatus(
    status: string
  ): never {
    return createError({
      code: "INVALID_PAYMENT_STATUS",
      message: `Unsupported payment status '${status}'.`,
      statusCode: 400,
    });
  },

  invalidWebhookSignature(): never {
    return createError({
      code: "INVALID_WEBHOOK_SIGNATURE",
      message: "Invalid payment webhook signature.",
      statusCode: 401,
    });
  },

  webhookAlreadyProcessed(
    paymentId: string
  ): never {
    return createError({
      code: "WEBHOOK_ALREADY_PROCESSED",
      message: `Webhook for payment '${paymentId}' has already been processed.`,
      statusCode: 409,
    });
  },

  verificationFailed(
    reason: string,
    cause?: unknown
  ): never {
    return createError({
      code: "PAYMENT_VERIFICATION_FAILED",
      message: reason,
      statusCode: 502,
      cause,
    });
  },

  initializationFailed(
    reason: string,
    cause?: unknown
  ): never {
    return createError({
      code: "PAYMENT_INITIALIZATION_FAILED",
      message: reason,
      statusCode: 500,
      cause,
    });
  },

  gatewayError(
    message: string,
    cause?: unknown
  ): never {
    return createError({
      code: "PAYMENT_GATEWAY_ERROR",
      message,
      statusCode: 502,
      cause,
    });
  },

  gatewayTimeout(
    cause?: unknown
  ): never {
    return createError({
      code: "PAYMENT_GATEWAY_TIMEOUT",
      message: "The payment gateway did not respond in time.",
      statusCode: 504,
      cause,
    });
  },

  paymentDeclined(
    reason: string
  ): never {
    return createError({
      code: "PAYMENT_DECLINED",
      message: reason,
      statusCode: 402,
    });
  },

  configurationError(
    message: string
  ): never {
    return createError({
      code: "PAYMENT_CONFIGURATION_ERROR",
      message,
      statusCode: 500,
    });
  },
});