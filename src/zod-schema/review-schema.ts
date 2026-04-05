import z from "zod";

export const reviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  title: z
    .string()
    .max(150, "Title must be 150 characters or fewer")
    .trim()
    .optional()
    .or(z.literal("")),
  body: z
    .string()
    .max(2000, "Review must be 2000 characters or fewer")
    .trim()
    .optional()
    .or(z.literal("")),
});

export type ReviewSchema = z.infer<typeof reviewSchema>;
