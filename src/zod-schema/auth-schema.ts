import z from "zod";

export const SignInSchema = z.object({
  email: z.email(),
  password: z.string().min(6, {
    message: "Min 6 character",
  }),
});

export const SignUpSchema = z.object({
  name: z.string().min(3, { message: "Min 3 character" }),
  email: z.email(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[a-z]/, { message: "Must include a lowercase letter" })
    .regex(/[A-Z]/, { message: "Must include an uppercase letter" })
    .regex(/\d/, { message: "Must include a number" })
    .regex(/[^A-Za-z\d]/, { message: "Must include a special character" }),
});

export type SignUpSchemaType = z.infer<typeof SignUpSchema>;
export type SignInSchemaType = z.infer<typeof SignInSchema>;

export function calculatePasswordStrength(password: string) {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^A-Za-z\d]/.test(password)) strength++;

  return strength; // 0–5
}
