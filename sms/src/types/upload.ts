import { z } from "zod";

const MAX_FILENAME_LENGTH = 180;

export const presignUploadSchema = z.object({
  filename: z
    .string()
    .min(1, "Filename is required")
    .max(MAX_FILENAME_LENGTH, "Filename is too long"),
  fileType: z.string().min(1, "File type is required"),
  size: z.number().int().positive("File size must be > 0"),
});

export const createFileRecordSchema = z.object({
  provider: z.literal("s3"),
  bucket: z.string().min(1, "Bucket is required"),
  key: z.string().min(1, "Object key is required"),
  url: z.string().url("Invalid URL"),
  originalName: z.string().min(1, "Original name is required"),
  mimeType: z.string().min(1, "MIME type is required"),
  size: z.number().int().positive("File size must be > 0"),
});

export type PresignUploadInput = z.infer<typeof presignUploadSchema>;
export type CreateFileRecordInput = z.infer<typeof createFileRecordSchema>;
