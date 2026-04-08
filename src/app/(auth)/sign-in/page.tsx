"use client";

import { SignInSchema, type SignInSchemaType } from "@/zod-schema/auth-schema";
import { authClient } from "@/server/better-auth/client";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useRouter } from "nextjs-toploader/app";
import { useSearchParams } from "next/navigation";
import { QueryClient } from "@tanstack/react-query";
import { vendorKeys } from "@/lib/cache-keys";
import Image from "next/image";

const SignUser = () => {
  const qc = new QueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const form = useForm<SignInSchemaType>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { handleSubmit, control, reset } = form;

  const loginAction = async (values: SignInSchemaType) => {
    const parsedInput = SignInSchema.safeParse(values);
    if (!parsedInput.success) {
      throw new Error("Invalid Data");
    }

    const res = await authClient.signIn.email({
      email: parsedInput.data.email,
      password: parsedInput.data.password,
    });

    if (res.error) {
      throw new Error(res.error.message || "User Not Found");
    }
    qc.refetchQueries({
      type: "all",
      queryKey: vendorKeys.byUser(res.data.user.id),
    });
    return res.data;
  };

  const onSubmit = async (values: SignInSchemaType) => {
    setIsSubmitting(true);
    try {
      await loginAction(values);

      toast.success("Login Success");
      setIsSubmitting(false);

      router.push(redirect);
    } catch (error: any) {
      setIsSubmitting(false);
      toast.danger(error.message);
    }
  };

  const handleDemoLogin = async () => {
    setIsSubmitting(true);
    try {
      await loginAction({
        email: "vendor2@example.com",
        password: "password123",
      });

      toast.success("Demo Login Success");
      router.push(redirect);
    } catch (error: any) {
      setIsSubmitting(false);
      toast.danger(error.message);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-6">
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <Image
            // className="mb-4"
            width={90}
            height={90}
            alt="logo"
            src={"/market-flow-logo.png"}
          />
          {/* <h1
            className="text-2xl font-semibold tracking-tight"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            MarketFlow
          </h1> */}
          <p className="text-md text-zinc-500">Welcome back</p>
        </div>
        <Card className="border p-6">
          <Form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
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
                  {isPending ? "Signing in..." : "Sign in"}
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              isPending={isSubmitting}
              onClick={handleDemoLogin}
              fullWidth
            >
              {({ isPending }) => (
                <span className="flex items-center justify-center gap-2">
                  {isPending && <Spinner color="current" size="sm" />}
                  {isPending ? "Signing in..." : "Demo Login"}
                </span>
              )}
            </Button>
          </Form>
        </Card>

        <div className="mt-5 flex flex-col items-center gap-3">
          <p className="text-sm">
            Don't have an account?{" "}
            <button
              onClick={() =>
                // router.push("/sign-up")
                router.push(`/sign-up?redirect=${encodeURIComponent(redirect)}`)
              }
              className="font-medium"
            >
              Sign up
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

export default SignUser;
