import { z } from "zod";
import { ValidationSchemas } from "@/lib/validation";

export const sendEmailSchema = z.object({
  to: ValidationSchemas.email,
  subject: z.string().min(1, "Subject is required").max(200),
  message: z.string().min(1, "Message (HTML) is required"),
});

export type SendEmailInput = z.infer<typeof sendEmailSchema>;
