import z from "zod";

export const updateStatusSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("processing") }),
  z.object({
    status: z.literal("shipped"),
    trackingNumber: z.string().min(1, "Tracking number is required"),
    trackingUrl: z.url().optional().or(z.literal("")),
  }),
  z.object({ status: z.literal("delivered") }),
]);

export type UpdateOrderItemStatusInput = z.infer<typeof updateStatusSchema>;
