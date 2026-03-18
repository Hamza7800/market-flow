"use client";
import { SignUpSchema, type SignUpSchemaType } from "@/zod-schema/auth-schema";
import { authClient } from "@/server/better-auth/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Card,
  FieldError,
  Form,
  Input,
  Label,
  Spinner,
  TextField,
  toast,
} from "@heroui/react";

const SignUpUser = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const form = useForm<SignUpSchemaType>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const { handleSubmit, control, reset } = form;

  const sigUpAction = async (values: SignUpSchemaType) => {
    const parsedInput = SignUpSchema.safeParse(values);
    if (!parsedInput.success) {
      throw new Error("Invalid Data");
    }

    const res = await authClient.signUp.email({
      name: parsedInput.data.name,
      email: parsedInput.data.email,
      password: parsedInput.data.password,
    });

    if (res.error) {
      throw new Error(res.error.message || "Unable to create account");
    }
    return res.data;
  };

  const onSubmit = async (values: SignUpSchemaType) => {
    setIsSubmitting(true);
    try {
      await sigUpAction(values);

      toast.success("Account created");
      setIsSubmitting(false);
      router.push("/onboarding");
    } catch (error: any) {
      setIsSubmitting(false);
      toast.danger(error.message);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-6">
      <div className="relative w-full max-w-sm">
        <Card className="border p-6">
          <Form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <TextField {...field} isInvalid={fieldState.invalid}>
                  <Label className="mb-1.5 block text-xs font-medium text-zinc-400">
                    Full name
                  </Label>
                  <Input variant="secondary" placeholder="John Wick" />
                  <FieldError className="mt-1 text-xs text-red-400">
                    {fieldState.error?.message}
                  </FieldError>
                </TextField>
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="email"
                  isInvalid={fieldState.invalid}
                >
                  <Label className="mb-1.5 block text-xs font-medium text-zinc-400">
                    Email
                  </Label>
                  <Input variant="secondary" placeholder="john@example.com" />
                  <FieldError className="mt-1 text-xs text-red-400">
                    {fieldState.error?.message}
                  </FieldError>
                </TextField>
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="password"
                  isInvalid={fieldState.invalid}
                >
                  <Label className="mb-1.5 block text-xs font-medium text-zinc-400">
                    Password
                  </Label>
                  <Input variant="secondary" placeholder="••••••••" />
                  <FieldError className="mt-1 text-xs text-red-400">
                    {fieldState.error?.message}
                  </FieldError>
                </TextField>
              )}
            />

            <Button isPending={isSubmitting} type="submit" fullWidth>
              {({ isPending }) => (
                <span className="flex items-center justify-center gap-2">
                  {isPending && <Spinner color="current" size="sm" />}
                  {isPending ? "Creating account..." : "Create account"}
                </span>
              )}
            </Button>
          </Form>
        </Card>

        {/* footer */}
        <div className="mt-5 flex flex-col items-center gap-3">
          <p className="text-sm">
            Already have an account?{" "}
            <button
              onClick={() => router.push("/sign-in")}
              className="font-medium"
            >
              Sign in
            </button>
          </p>
          <button onClick={() => router.push("/")} className="text-xs">
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUpUser;
