import z from "zod";

export const productImageSchema = z.object({
  url: z.url("Must be a valid URL").min(1, "Image URL is required"),
  altText: z.string().max(255).optional().or(z.literal("")),
  sortOrder: z.number().int().min(0),
  isPrimary: z.boolean(),
  key: z.string(),
});

export type ProductImageSchema = z.infer<typeof productImageSchema>;

export const productVariantSchema = z.object({
  // Present on existing variants, absent on new ones
  id: z.uuid().optional(),
  name: z
    .string()
    .min(1, "Variant name is required")
    .max(100, "Variant name must be 100 characters or fewer"),
  options: z
    .record(z.string(), z.string())
    .refine(
      (v) => Object.keys(v).length > 0,
      "Variant must have at least one option",
    ),
  price: z
    .number({ error: "Price must be a number" })
    .positive("Price must be greater than 0")
    .multipleOf(0.01, "Price can have at most 2 decimal places")
    .optional(),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  sku: z.string().max(100).optional().or(z.literal("")),
  imageUrl: z.url("Must be a valid URL").optional().or(z.literal("")),
});

export type ProductVariantSchema = z.infer<typeof productVariantSchema>;

const baseProductSchema = z.object({
  name: z
    .string()
    .min(2, "Product name must be at least 2 characters")
    .max(255, "Product name must be 255 characters or fewer")
    .trim(),

  description: z
    .string()
    .max(10_000, "Description must be 10,000 characters or fewer")
    .optional()
    .or(z.literal("")),

  categoryId: z.uuid("Please select a valid category").optional(),

  basePrice: z
    .number({ error: "Price must be a number" })
    .positive("Price must be greater than 0")
    .multipleOf(0.01, "Price can have at most 2 decimal places"),

  hasVariants: z.boolean(),

  images: z.array(productImageSchema).max(10, "You can upload up to 10 images"),

  tagIds: z.array(z.uuid()),
});

const simpleProductSchema = baseProductSchema.extend({
  hasVariants: z.literal(false),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  variants: z.array(productVariantSchema).max(0),
});

const variantProductSchema = baseProductSchema.extend({
  hasVariants: z.literal(true),
  stock: z.number().int().min(0),
  variants: z
    .array(productVariantSchema)
    .min(1, "Add at least one variant")
    .max(100, "Maximum 100 variants per product"),
});

export const createProductSchema = z.discriminatedUnion("hasVariants", [
  simpleProductSchema,
  variantProductSchema,
]);

export type CreateProductSchema = z.infer<typeof createProductSchema>;

export const createProductDefaults: CreateProductSchema = {
  name: "",
  description: "",
  categoryId: "",
  basePrice: 0,
  hasVariants: false,
  stock: 0,
  images: [
    {
      url: "",
      altText: "",
      isPrimary: false,
      key: "",
      sortOrder: 0,
    },
  ],
  variants: [
    {
      name: "",
      options: {},
      stock: 0,
      price: 0,
      sku: "",
    },
  ],
  tagIds: [""],
};

export const updateProductSchema = z
  .object({
    name: z
      .string()
      .min(2, "Product name must be at least 2 characters")
      .max(255)
      .trim()
      .optional(),

    description: z.string().max(10_000).optional().or(z.literal("")),

    categoryId: z.uuid().optional().nullable(),

    basePrice: z
      .number({ error: "Price must be a number" })
      .positive("Price must be greater than 0")
      .multipleOf(0.01)
      .optional(),

    hasVariants: z.boolean().optional(),

    stock: z.number().int().min(0).optional(),

    status: z.enum(["draft", "active", "archived"]).optional(),

    // Full arrays — server diffs against existing rows
    images: z.array(productImageSchema).max(10).optional(),
    variants: z.array(productVariantSchema).max(100).optional(),
    tagIds: z.array(z.uuid()).optional(),
  })
  .refine(
    (data) => {
      // If switching to variant mode, must supply at least one variant
      if (data.hasVariants === true && data.variants !== undefined) {
        return data.variants.length > 0;
      }
      return true;
    },
    {
      message: "Add at least one variant when enabling variant mode",
      path: ["variants"],
    },
  );

export type UpdateProductSchema = z.infer<typeof updateProductSchema>;

export const updateProductStatusSchema = z.object({
  status: z.enum(["draft", "active", "archived"]),
});

export type UpdateProductStatusSchema = z.infer<
  typeof updateProductStatusSchema
>;
