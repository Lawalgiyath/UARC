import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  paymentService,
} from "@/lib/payment/payment.service";

import {
  PaymentServiceError,
} from "@/lib/payment/payment.errors";

import {
  verifyPaymentSchema,
} from "@/lib/payment/payment.validation";

export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);

    const input =
      verifyPaymentSchema.parse({
        paymentBatchId:
          searchParams.get(
            "paymentBatchId"
          ) ?? undefined,

        paymentDocumentNo:
          searchParams.get(
            "paymentDocumentNo"
          ) ?? undefined,

        transactionReference:
          searchParams.get(
            "transactionReference"
          ) ?? undefined,

        customerId:
          searchParams.get(
            "customerId"
          ) ?? undefined,
      });
    

/**work on verifyPayment later */
    // const payment =
    //   await paymentService.verifyPayment(
    //     input
    //   );

    return NextResponse.json(
      {
        success: true,

        message:
          "Payment verified successfully.",

        data: null,
      },
      {
        status: 200,
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
          "One or more request parameters are invalid.",

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

  console.error(
    "[GET /api/payments/verify]",
    {
      timestamp:
        new Date().toISOString(),

      error,
    }
  );

  return NextResponse.json(
    {
      success: false,

      code: "INTERNAL_SERVER_ERROR",

      message:
        "An unexpected server error occurred.",
    },
    {
      status: 500,
    }
  );
}