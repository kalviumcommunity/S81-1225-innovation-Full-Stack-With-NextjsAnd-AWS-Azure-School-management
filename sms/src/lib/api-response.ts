import { NextResponse } from "next/server";

export enum StatusCode {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

export interface ApiResponse<T = null> {
  success: boolean;
  statusCode: StatusCode;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

/**
 * Success response handler
 */
export function successResponse<T>(
  data: T,
  message: string = "Request successful",
  statusCode: StatusCode = StatusCode.OK
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      statusCode,
      message,
      data,
    },
    { status: statusCode }
  );
}

/**
 * Error response handler
 */
export function errorResponse(
  message: string = "An error occurred",
  statusCode: StatusCode = StatusCode.INTERNAL_SERVER_ERROR,
  errors?: Record<string, string[]>
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      statusCode,
      message,
      errors,
    },
    { status: statusCode }
  );
}

/**
 * Validation error response
 */
export function validationError(
  errors: Record<string, string[]>,
  message: string = "Validation failed"
): NextResponse<ApiResponse> {
  return errorResponse(message, StatusCode.UNPROCESSABLE_ENTITY, errors);
}

/**
 * Not found response
 */
export function notFoundResponse(
  message: string = "Resource not found"
): NextResponse<ApiResponse> {
  return errorResponse(message, StatusCode.NOT_FOUND);
}

/**
 * Unauthorized response
 */
export function unauthorizedResponse(
  message: string = "Unauthorized"
): NextResponse<ApiResponse> {
  return errorResponse(message, StatusCode.UNAUTHORIZED);
}

/**
 * Forbidden response
 */
export function forbiddenResponse(
  message: string = "Forbidden"
): NextResponse<ApiResponse> {
  return errorResponse(message, StatusCode.FORBIDDEN);
}
