import z from "zod";

export const addToCartSchema = z.object({
  productId: z.uuid(),
  variantId: z.uuid().nullable().optional(),
  quantity: z.number().int().min(1).max(99).default(1),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;

export const updateCartItemSchema = z.object({
  cartItemId: z.uuid(),
  quantity: z.number().int().min(0).max(99),
});

export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
