"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Card,
  ErrorMessage,
  FieldError,
  Form,
  Input,
  Label,
  Spinner,
  TextArea,
  TextField,
} from "@heroui/react";
import { ProfileImageUploader } from "./profile-image-upload";
import { BannerImageUploader } from "./banner-image-upload";
import { useUpdateVendor, useVendorApplication } from "@/hooks/use-vedor";
import {
  vendorDefaults,
  vendorSchema,
  type VendorSchema,
} from "@/zod-schema/vendor-profile-schema";
import type { VendorRow } from "@/actions/vendor";

interface VendorFormProps {
  initialData?: VendorRow | null;
}

const VendorForm = ({ initialData }: VendorFormProps) => {
  const isEditMode = !!initialData;

  const vendorApplication = useVendorApplication();
  const updateVendor = useUpdateVendor();
  const mutation = isEditMode ? updateVendor : vendorApplication;

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<VendorSchema>({
    resolver: zodResolver(vendorSchema),
    defaultValues: initialData
      ? {
          storeName: initialData.storeName,
          description: initialData.description ?? "",
          logo:
            initialData.logoUrl && initialData.logoKey
              ? { url: initialData.logoUrl, key: initialData.logoKey }
              : {
                  url: "",
                  key: "",
                },
          banner:
            initialData.bannerUrl && initialData.bannerKey
              ? { url: initialData.bannerUrl, key: initialData.bannerKey }
              : {
                  url: "",
                  key: "",
                },
          contactEmail: initialData.contactEmail ?? "",
          returnPolicy: initialData.returnPolicy ?? "",
        }
      : vendorDefaults,
  });

  const isSubmitting = mutation.isPending;

  const onSubmit = (values: VendorSchema) => {
    mutation.mutate(values);
  };

  return (
    <Card className="shadow-none">
      <Form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
        {/* Banner */}
        <Controller
          control={control}
          name="banner"
          render={({ field, fieldState }) => (
            <div className="flex flex-col gap-1">
              <BannerImageUploader
                value={field.value}
                onChange={field.onChange}
                disabled={isSubmitting}
              />
              {errors.banner?.url && (
                <ErrorMessage className="text-xs text-[--danger]">
                  {errors.banner.url.message}
                </ErrorMessage>
              )}
            </div>
          )}
        />

        {/* Logo */}
        <Controller
          control={control}
          name="logo"
          render={({ field, fieldState }) => (
            <div className="flex flex-col gap-1">
              {/* {console.log(fieldState.invalid)} */}
              <ProfileImageUploader
                value={field.value}
                onChange={field.onChange}
                disabled={isSubmitting}
              />
              {errors.logo?.url && (
                <ErrorMessage>{errors.logo.url.message}</ErrorMessage>
              )}
            </div>
          )}
        />

        {/* Store Name */}
        <Controller
          control={control}
          name="storeName"
          render={({ field, fieldState }) => (
            <TextField fullWidth {...field} isInvalid={fieldState.invalid}>
              <Label className="mb-1.5 block text-xs font-medium text-zinc-400">
                Store Name
              </Label>
              <Input variant="secondary" placeholder="My Shop" />
              <FieldError className="mt-1 text-xs text-red-400">
                {fieldState.error?.message}
              </FieldError>
            </TextField>
          )}
        />

        {/* Store Slug — only shown in edit mode */}
        {/* {isEditMode && (
              <Controller
                control={control}
                name="storeSlug"
                render={({ field, fieldState }) => (
                  <TextField fullWidth {...field} isInvalid={fieldState.invalid}>
                    <Label className="mb-1.5 block text-xs font-medium text-zinc-400">
                      Store Slug
                    </Label>
                    <Input variant="secondary" placeholder="my-shop" />
                    <FieldError className="mt-1 text-xs text-red-400">
                      {fieldState.error?.message}
                    </FieldError>
                  </TextField>
                )}
              />
            )} */}

        {/* Description */}
        <Controller
          control={control}
          name="description"
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              value={field.value ?? ""}
              isInvalid={fieldState.invalid}
            >
              <Label className="mb-1.5 block text-xs font-medium text-zinc-400">
                Description
              </Label>
              <TextArea
                variant="secondary"
                placeholder="Tell customers about your store"
              />
              <FieldError className="mt-1 text-xs text-red-400">
                {fieldState.error?.message}
              </FieldError>
            </TextField>
          )}
        />

        {/* Contact Email */}
        <Controller
          control={control}
          name="contactEmail"
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              value={field.value ?? ""}
              isInvalid={fieldState.invalid}
            >
              <Label className="mb-1.5 block text-xs font-medium text-zinc-400">
                Contact Email
              </Label>
              <Input
                type="email"
                variant="secondary"
                placeholder="store@example.com"
              />
              <FieldError className="mt-1 text-xs text-red-400">
                {fieldState.error?.message}
              </FieldError>
            </TextField>
          )}
        />

        {/* Return Policy */}
        <Controller
          control={control}
          name="returnPolicy"
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              value={field.value ?? ""}
              isInvalid={fieldState.invalid}
            >
              <Label className="mb-1.5 block text-xs font-medium text-zinc-400">
                Return Policy
              </Label>
              <TextArea
                variant="secondary"
                placeholder="Describe your return policy"
              />
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
              {isPending
                ? isEditMode
                  ? "Saving..."
                  : "Submitting..."
                : isEditMode
                  ? "Save Changes"
                  : "Submit Application"}
            </span>
          )}
        </Button>
      </Form>
    </Card>
  );
};

export default VendorForm;
