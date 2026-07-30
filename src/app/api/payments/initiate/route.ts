import { NextRequest, NextResponse } from "next/server";

import { ZodError } from "zod";

import {
  createPaymentSchema,
} from "@/lib/payment/payment.validation";

import {
  paymentService,
} from "@/lib/payment/payment.service";

import {
  PaymentServiceError,
} from "@/lib/payment/payment.errors";

import {
  TranzgateError,
} from "@/lib/payment/tranzgate.errors";

export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const body = await request.json();

    const input =
      createPaymentSchema.parse(body);

    const payment =
      await paymentService.initializePayment(
        input
      );

    return NextResponse.json(
      {
        success: true,

        message:
          "Payment initialized successfully.",

        data: payment,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return handleError(error);
  }
}

function handleError(
  error: unknown
): NextResponse {

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,

        code: "VALIDATION_ERROR",

        message:
          "Request validation failed.",

        errors: error.flatten(),
      },
      {
        status: 400,
      }
    );
  }

  if (
    error instanceof PaymentServiceError
  ) {
    return NextResponse.json(
      {
        success: false,

        code: error.code,

        message: error.message,
      },
      {
        status: error.statusCode,
      }
    );
  }

  if (
    error instanceof TranzgateError
  ) {
    return NextResponse.json(
      {
        success: false,

        code: error.code,

        message: error.message,
      },
      {
        status: error.statusCode,
      }
    );
  }

  console.error(error);

  return NextResponse.json(
    {
      success: false,

      code: "INTERNAL_SERVER_ERROR",

      message:
        "An unexpected error occurred.",
    },
    {
      status: 500,
    }
  );
}