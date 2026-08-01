import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { paymentService } from "@/lib/payment/payment.service";
import { PaymentServiceError } from "@/lib/payment/payment.errors";
import { verifyPaymentSchema } from "@/lib/payment/payment.validation";

export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const body =
      await request.json();

    const input =
      verifyPaymentSchema.parse(body);

    if (!input.paymentBatchId) {
      return NextResponse.json(
        {
          success: false,
          code: "MISSING_PAYMENT_BATCH_ID",
          message:
            "paymentBatchId is required for verification.",
        },
        {
          status: 400,
        }
      );
    }

    const payment =
      await paymentService.verifyPayment(
        input.paymentBatchId
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "Payment verified successfully.",
        data: payment,
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

  if (error instanceof SyntaxError) {
    return NextResponse.json(
      {
        success: false,
        code: "INVALID_JSON",
        message:
          "Invalid JSON payload.",
      },
      {
        status: 400,
      }
    );
  }


  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        code: "VALIDATION_ERROR",
        message:
          "One or more request parameters are invalid.",
        errors:
          error.flatten(),
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
        code:
          error.code,
        message:
          error.message,
      },
      {
        status:
          error.statusCode,
      }
    );
  }


  console.error(
    "[POST /api/payments/verify]",
    {
      timestamp:
        new Date().toISOString(),

      error,
    }
  );


  return NextResponse.json(
    {
      success: false,
      code:
        "INTERNAL_SERVER_ERROR",
      message:
        "An unexpected server error occurred.",
    },
    {
      status: 500,
    }
  );
}