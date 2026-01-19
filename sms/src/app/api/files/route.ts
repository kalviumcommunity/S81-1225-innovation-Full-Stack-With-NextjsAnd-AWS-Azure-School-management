import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateRequest } from "@/middleware/auth";
import { validateData } from "@/lib/validation";
import {
  errorResponse,
  StatusCode,
  successResponse,
  validationError,
} from "@/lib/api-response";
import { createFileRecordSchema } from "@/types/upload";

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error) return error;
    if (!user) return errorResponse("Unauthorized", StatusCode.UNAUTHORIZED);

    const body = await request.json();
    const validation = validateData(createFileRecordSchema, body);
    if (!validation.success) return validationError(validation.errors);

    const { provider, bucket, key, url, originalName, mimeType, size } =
      validation.data;

    const record = await prisma.uploadedFile.create({
      data: {
        provider,
        bucket,
        key,
        url,
        originalName,
        mimeType,
        size,
        uploaderId: user.userId,
      },
    });

    return successResponse(
      record,
      "File record stored successfully",
      StatusCode.CREATED
    );
  } catch (err) {
    console.error("Create file record error:", err);
    return errorResponse(
      "DB insertion failed",
      StatusCode.INTERNAL_SERVER_ERROR
    );
  }
}
