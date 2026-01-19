import { NextRequest } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { authenticateRequest } from "@/middleware/auth";
import { validateData } from "@/lib/validation";
import {
  errorResponse,
  StatusCode,
  successResponse,
  validationError,
} from "@/lib/api-response";
import { getServerEnv } from "@/lib/env";
import { presignUploadSchema } from "@/types/upload";

const DEFAULT_TTL_SECONDS = 60;
const DEFAULT_MAX_BYTES = 10 * 1024 * 1024; // 10MB

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

function sanitizeFilename(filename: string): string {
  const trimmed = filename.trim();
  const base = trimmed.split("/").pop()?.split("\\").pop() ?? trimmed;
  // Keep it simple: letters, numbers, dot, dash, underscore
  return base.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function buildS3ObjectUrl(bucket: string, region: string, key: string): string {
  // Keep slashes while URL-encoding each segment.
  const encodedKey = key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `https://${bucket}.s3.${region}.amazonaws.com/${encodedKey}`;
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error) return error;
    if (!user) return errorResponse("Unauthorized", StatusCode.UNAUTHORIZED);

    const body = await request.json();
    const validation = validateData(presignUploadSchema, body);
    if (!validation.success) return validationError(validation.errors);

    const { filename, fileType, size } = validation.data;

    if (!ALLOWED_MIME_TYPES.has(fileType)) {
      return errorResponse("Unsupported file type", StatusCode.BAD_REQUEST);
    }

    const env = getServerEnv();
    const region = env.AWS_REGION;
    const bucket = env.AWS_BUCKET_NAME;

    if (!region || !bucket) {
      return errorResponse(
        "S3 is not configured. Set AWS_REGION and AWS_BUCKET_NAME.",
        StatusCode.SERVICE_UNAVAILABLE
      );
    }

    const maxBytes = env.UPLOAD_MAX_BYTES ?? DEFAULT_MAX_BYTES;
    if (size > maxBytes) {
      return errorResponse(
        `File too large. Max allowed is ${maxBytes} bytes.`,
        StatusCode.BAD_REQUEST
      );
    }

    const safeName = sanitizeFilename(filename);
    const key = `uploads/${user.userId}/${crypto.randomUUID()}-${safeName}`;

    const s3 = new S3Client({ region });

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: fileType,
      Metadata: {
        uploaderId: user.userId,
        originalName: safeName,
      },
    });

    const ttl = env.S3_PRESIGN_TTL_SECONDS ?? DEFAULT_TTL_SECONDS;
    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: ttl,
    });

    const fileUrl = buildS3ObjectUrl(bucket, region, key);

    return successResponse(
      {
        uploadUrl,
        provider: "s3" as const,
        bucket,
        key,
        fileUrl,
        expiresInSeconds: ttl,
      },
      "Pre-signed upload URL generated",
      StatusCode.CREATED
    );
  } catch (err) {
    console.error("Presign upload error:", err);
    return errorResponse(
      "Failed to generate pre-signed URL",
      StatusCode.INTERNAL_SERVER_ERROR
    );
  }
}
