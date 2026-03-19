"use client";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { StoreSchema } from "@/zod-schema/vendor-profile-schema";
import { storeDefaults, storeSchema } from "@/zod-schema/vendor-profile-schema";
import { useRouter } from "nextjs-toploader/app";
import {
  Button,
  Card,
  FieldError,
  Form,
  Input,
  Label,
  Spinner,
  TextArea,
  TextField,
} from "@heroui/react";
import { useVendorApplication } from "@/hooks/use-vedor";

const VendorOnboarding = () => {
  const router = useRouter();
  const vendorApplication = useVendorApplication();

  const { handleSubmit, control, reset } = useForm<StoreSchema>({
    resolver: zodResolver(storeSchema),
    defaultValues: storeDefaults,
  });

  const isSubmitting = vendorApplication.isPending;

  const onSubmit = (values: StoreSchema) => {
    vendorApplication.mutate(values);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-6">
      <div className="relative w-full max-w-lg">
        <Card className="border p-6">
          <Form
            className="flex flex-col gap-2"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Controller
              control={control}
              name="storeName"
              render={({ field, fieldState }) => (
                <TextField fullWidth {...field} isInvalid={fieldState.invalid}>
                  <Label className="bg mb-1.5 block text-xs font-medium text-zinc-400">
                    Store Name
                  </Label>
                  <Input variant="secondary" placeholder="My Shop" />
                  <FieldError className="mt-1 text-xs text-red-400">
                    {fieldState.error?.message}
                  </FieldError>
                </TextField>
              )}
            />

            {/* <Controller
                control={control}
                name="storeSlug"
                render={({ field, fieldState }) => (
                  <TextField
                    fullWidth
                    {...field}
                    isInvalid={fieldState.invalid}
                  >
                    <Label className="mb-1.5 block text-xs font-medium text-zinc-400">
                      Store Slug
                    </Label>
                    <Input variant="secondary" placeholder="Shop-24" />
                    <FieldError className="mt-1 text-xs text-red-400">
                      {fieldState.error?.message}
                    </FieldError>
                  </TextField>
                )}
              /> */}

            <Controller
              control={control}
              name="description"
              render={({ field, fieldState }) => (
                <TextField {...field} isInvalid={fieldState.invalid}>
                  <Label className="mb-1.5 block text-xs font-medium text-zinc-400">
                    Description
                  </Label>
                  <TextArea variant="secondary" placeholder="Description" />
                  <FieldError className="mt-1 text-xs text-red-400">
                    {fieldState.error?.message}
                  </FieldError>
                </TextField>
              )}
            />

            <Controller
              control={control}
              name="contactEmail"
              render={({ field, fieldState }) => (
                <TextField {...field} isInvalid={fieldState.invalid}>
                  <Label className="mb-1.5 block text-xs font-medium text-zinc-400">
                    Contact Email
                  </Label>
                  <Input
                    type="email"
                    variant="secondary"
                    placeholder="Description"
                  />
                  <FieldError className="mt-1 text-xs text-red-400">
                    {fieldState.error?.message}
                  </FieldError>
                </TextField>
              )}
            />

            <Controller
              control={control}
              name="returnPolicy"
              render={({ field, fieldState }) => (
                <TextField {...field} isInvalid={fieldState.invalid}>
                  <Label className="mb-1.5 block text-xs font-medium text-zinc-400">
                    Return Policy
                  </Label>
                  <TextArea variant="secondary" placeholder="Return Policy" />
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
                  {isPending ? "Submitting..." : "Submit"}
                </span>
              )}
            </Button>
          </Form>
        </Card>

        <div className="mt-5 flex flex-col items-center gap-3">
          <button onClick={() => router.push("/")} className="text-xs">
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorOnboarding;
