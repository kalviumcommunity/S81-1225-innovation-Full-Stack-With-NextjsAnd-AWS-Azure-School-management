import { NextRequest } from "next/server";

import {
  errorResponse,
  StatusCode,
  successResponse,
  validationError,
} from "@/lib/api-response";
import { sendEmail } from "@/lib/email";
import { isSendGridConfigured } from "@/lib/email/sendgrid";
import { validateData } from "@/lib/validation";
import { sendEmailSchema } from "@/types/email";
import { authenticateRequest } from "@/middleware/auth";
import { checkRateLimit } from "@/middleware/helpers";

export async function POST(request: NextRequest) {
  try {
    // Protect this endpoint to avoid abuse.
    const { user, error } = await authenticateRequest(request);
    if (error) return error;
    if (!user) return errorResponse("Unauthorized", StatusCode.UNAUTHORIZED);

    // Lightweight rate limit: 10 emails / minute / user
    const identifier = user.userId;
    const allowed = checkRateLimit(`email:${identifier}`, 10, 60 * 1000);
    if (!allowed) {
      return errorResponse(
        "Rate limit exceeded. Please try again later.",
        StatusCode.TOO_MANY_REQUESTS
      );
    }

    if (!isSendGridConfigured()) {
      return errorResponse(
        "Email provider is not configured",
        StatusCode.SERVICE_UNAVAILABLE,
        {
          SENDGRID_API_KEY: ["Missing"],
          SENDGRID_SENDER: ["Missing"],
        }
      );
    }

    const body = await request.json();

    const validation = validateData(sendEmailSchema, body);
    if (!validation.success) return validationError(validation.errors);

    const { to, subject, message } = validation.data;

    const result = await sendEmail({
      to,
      subject,
      html: message,
    });

    console.log("Email sent", {
      provider: result.provider,
      to,
      messageId: result.messageId,
    });

    return successResponse(
      {
        provider: result.provider,
        messageId: result.messageId,
        headers: result.responseHeaders,
      },
      "Email sent successfully",
      StatusCode.OK
    );
  } catch (err) {
    console.error("Email send failed:", err);
    return errorResponse("Email send failed", StatusCode.INTERNAL_SERVER_ERROR);
  }
}
