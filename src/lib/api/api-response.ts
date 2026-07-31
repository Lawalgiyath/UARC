import { NextResponse } from "next/server";

export class ApiResponse {
  static success<T>(
    data: T,
    message = "Success",
    status = 200,
    headers?: HeadersInit
  ) {
    return NextResponse.json(
      {
        success: true,
        message,
        data,
      },
      {
        status,
        headers,
      }
    );
  }

  static created<T>(
    data: T,
    message = "Created successfully",
    headers?: HeadersInit
  ) {
    return this.success(
      data,
      message,
      201,
      headers
    );
  }

  static badRequest(
    message = "Bad request",
    errors?: unknown
  ) {
    return NextResponse.json(
      {
        success: false,
        code: "BAD_REQUEST",
        message,
        errors,
      },
      {
        status: 400,
      }
    );
  }

  static unauthorized(
    message = "Unauthorized"
  ) {
    return NextResponse.json(
      {
        success: false,
        code: "UNAUTHORIZED",
        message,
      },
      {
        status: 401,
      }
    );
  }

  static forbidden(
    message = "Forbidden"
  ) {
    return NextResponse.json(
      {
        success: false,
        code: "FORBIDDEN",
        message,
      },
      {
        status: 403,
      }
    );
  }

  static notFound(
    message = "Resource not found"
  ) {
    return NextResponse.json(
      {
        success: false,
        code: "NOT_FOUND",
        message,
      },
      {
        status: 404,
      }
    );
  }

  static conflict(
    message = "Conflict"
  ) {
    return NextResponse.json(
      {
        success: false,
        code: "CONFLICT",
        message,
      },
      {
        status: 409,
      }
    );
  }

  static error(
    message = "Internal server error",
    status = 500
  ) {
    return NextResponse.json(
      {
        success: false,
        code: "INTERNAL_SERVER_ERROR",
        message,
      },
      {
        status,
      }
    );
  }

  static deleted(
    message = "Deleted successfully"
  ) {
    return NextResponse.json(
      {
        success: true,
        message,
      },
      {
        status: 200,
      }
    );
  }

  static noContent() {
    return new NextResponse(null, {
      status: 204,
    });
  }
}