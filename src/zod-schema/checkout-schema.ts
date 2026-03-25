import { z } from "zod";

export const checkoutSchema = z.object({
  email: z.string().email("Enter a valid email").trim(),
  phone: z
    .string()
    .min(7, "Enter a valid phone number")
    .max(20)
    .trim()
    .optional()
    .or(z.literal("")),

  fullName: z.string().min(2, "Enter your full name").max(100).trim(),
  line1: z.string().min(3, "Enter a street address").max(200).trim(),
  line2: z.string().max(200).trim().optional().or(z.literal("")),
  city: z.string().min(2, "Enter a city").max(100).trim(),
  state: z.string().max(100).trim().optional().or(z.literal("")),
  postalCode: z.string().min(2, "Enter a postal code").max(20).trim(),
  country: z.string().length(2, "Select a country").toUpperCase(),

  discountCode: z.string().trim().optional().or(z.literal("")),

  saveAddress: z.boolean(),
});

export type CheckoutSchema = z.infer<typeof checkoutSchema>;

export const checkoutDefaults: CheckoutSchema = {
  email: "",
  phone: "",
  fullName: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "US",
  discountCode: "",
  saveAddress: false,
};

export const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "NL", name: "Netherlands" },
  { code: "PK", name: "Pakistan" },
  { code: "IN", name: "India" },
  { code: "AE", name: "United Arab Emirates" },
] as const;
