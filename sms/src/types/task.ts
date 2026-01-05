import { z } from "zod";

/**
 * Task validation schemas
 */
export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  priority: z.number().int().min(1).max(5).default(1),
  dueDate: z.string().datetime().optional(),
  projectId: z.string().cuid("Invalid project ID"),
  assignedTo: z.string().cuid("Invalid user ID").optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const updateTaskStatusSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
