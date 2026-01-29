import { z } from "zod";

export const createSubmissionSchema = z.object({
  taskId: z.string().cuid("Invalid task ID"),
  content: z.string().min(1, "Content is required").max(10000),
  fileUrl: z.string().url("Invalid file URL").optional(),
});

export const gradeSubmissionSchema = z.object({
  grade: z.number().int().min(0).max(100).nullable().optional(),
  feedback: z.string().max(5000).nullable().optional(),
});

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
export type GradeSubmissionInput = z.infer<typeof gradeSubmissionSchema>;
