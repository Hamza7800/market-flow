import z from "zod";

// const storeSlug = z
//   .string()
//   .min(3, "Slug must be at least 3 characters")
//   .max(60, "Slug must be 60 characters or fewer")
//   .regex(
//     /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
//     "Only lowercase letters, numbers, and hyphens — no leading/trailing hyphens",
//   );

const httpsUrl = z
  .url("Must be a valid URL")
  .refine((v) => v.startsWith("https://"), "Must start with https://");

export const imageSchema = z.object({
  url: z.url("Must be a valid URL").min(1, "Image URL is required"),
  key: z.string(),
});

export const vendorSchema = z.object({
  storeName: z
    .string()
    .min(2, "Store name must be at least 2 characters")
    .max(80, "Store name must be 80 characters or fewer")
    .trim(),

  description: z
    .string()
    .max(1000, "Description must be 1000 characters or fewer")
    .trim()
    .optional()
    .or(z.literal("")),

  logo: imageSchema,

  banner: imageSchema,
  contactEmail: z
    .email("Must be a valid email address")
    .max(255)
    .trim()
    .optional()
    .or(z.literal("")),

  returnPolicy: z
    .string()
    .max(5000, "Return policy must be 5000 characters or fewer")
    .trim()
    .optional()
    .or(z.literal("")),
});

export type VendorSchema = z.infer<typeof vendorSchema>;

export type ImageSchema = z.infer<typeof imageSchema>;

export const vendorDefaults: VendorSchema = {
  storeName: "",
  description: "",
  logo: {
    key: "",
    url: "",
  },
  banner: {
    key: "",
    url: "",
  },
  contactEmail: "",
  returnPolicy: "",
};
