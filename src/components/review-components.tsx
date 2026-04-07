"use client";

import {
  Alert,
  Button,
  FieldError,
  Input,
  Label,
  Skeleton,
  Spinner,
  TextArea,
  TextField,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  PencilIcon,
  StarIcon,
  Trash2Icon,
  MessageSquarePlus,
} from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  useCreateReview,
  useDeleteReview,
  useUpdateReview,
  useUserReviewForOrderItem,
} from "@/hooks/use-reviews";
import { reviewSchema, type ReviewSchema } from "@/zod-schema/review-schema";

// ---------------------------------------------------------------------------
// StarRating
// ---------------------------------------------------------------------------
export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = "md",
}: {
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;
  const sizeClass = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-7 w-7" }[size];

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          className={`transition-transform ${
            readOnly
              ? "cursor-default"
              : "cursor-pointer hover:scale-110 active:scale-95"
          }`}
          aria-label={`${star} star${star !== 1 ? "s" : ""}`}
        >
          <StarIcon
            className={[
              sizeClass,
              "transition-all duration-200",
              star <= active
                ? "fill-warning text-warning drop-shadow-sm"
                : "text-default-200 fill-default-50",
            ].join(" ")}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewForm({
  defaultValues,
  onSubmit,
  isLoading,
  onCancel,
  submitLabel = "Submit review",
}: {
  defaultValues?: Partial<ReviewSchema>;
  onSubmit: (values: ReviewSchema) => Promise<void>;
  isLoading: boolean;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewSchema>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: defaultValues?.rating ?? 0,
      title: defaultValues?.title ?? "",
      body: defaultValues?.body ?? "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="animate-in fade-in slide-in-from-top-2 w-full space-y-5 duration-300"
    >
      <div className="flex flex-col gap-1.5">
        <label className="text-default-700 text-sm font-medium">
          Overall Rating <span className="text-danger">*</span>
        </label>
        <Controller
          control={control}
          name="rating"
          render={({ field }) => (
            <div className="bg-default-50 border-divider w-fit rounded-xl border p-3">
              <StarRating
                value={field.value}
                onChange={field.onChange}
                size="lg"
              />
            </div>
          )}
        />
        {errors.rating && (
          <p className="text-danger mt-1 text-xs">{errors.rating.message}</p>
        )}
      </div>

      <Controller
        control={control}
        name="title"
        render={({ field, fieldState }) => (
          <TextField {...field} isInvalid={fieldState.invalid}>
            <Label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Title
            </Label>
            <Input
              fullWidth
              placeholder="What's most important to know?"
              className={"border-border border shadow-none"}
            />
            <FieldError className="mt-1 text-xs text-red-400">
              {fieldState.error?.message}
            </FieldError>
          </TextField>
        )}
      />

      <Controller
        control={control}
        name="body"
        render={({ field, fieldState }) => (
          <TextField {...field} isInvalid={fieldState.invalid}>
            <Label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Written Review
            </Label>
            <TextArea
              placeholder="What did you like or dislike? What did you use this product for?"
              rows={6}
              fullWidth
              className={"border-border border shadow-none"}
            />

            <FieldError className="mt-1 text-xs text-red-400">
              {fieldState.error?.message}
            </FieldError>
          </TextField>
        )}
      />

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" isPending={isLoading} className="font-medium">
          {({ isPending }) => (
            <span className="flex items-center justify-center gap-2">
              {isPending && <Spinner color="current" size="sm" />}
              {submitLabel}
            </span>
          )}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="danger-soft"
            onPress={onCancel}
            isDisabled={isLoading}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

export function OrderItemReview({
  orderItemId,
  productId,
  productName,
  orderId,
}: {
  orderItemId: string;
  productId: string;
  productName: string;
  orderId: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const { data: existing, isLoading } = useUserReviewForOrderItem(orderItemId);

  const create = useCreateReview(productId, orderId);
  const update = useUpdateReview(productId, orderItemId);
  const remove = useDeleteReview(productId, orderItemId);
  const [editing, setEditing] = useState(false);

  if (isLoading) return <Skeleton className="mt-3 h-10 w-full rounded-lg" />;

  if (existing && !editing) {
    return (
      <div className="bg-default-50 border-divider hover:border-default-300 mt-4 w-full rounded-2xl border p-4 transition-all">
        <div className="mb-2 flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-default-500 text-xs font-semibold tracking-wider uppercase">
              Your Review
            </span>
            <StarRating value={existing.rating} readOnly size="sm" />
          </div>
          <div className="flex gap-1">
            <Button
              isIconOnly
              // variant="light"
              size="sm"
              onPress={() => setEditing(true)}
            >
              <PencilIcon className="text-default-500 hover:text-primary h-4 w-4 transition-colors" />
            </Button>
            <Button
              isIconOnly
              variant="danger-soft"
              // variant="light"
              size="sm"
              onPress={() => remove.mutateAsync(existing.id)}
            >
              <Trash2Icon className="text-default-500 hover:text-danger h-4 w-4 transition-colors" />
            </Button>
          </div>
        </div>
        {existing.title && (
          <h4 className="mt-2 text-sm font-medium">{existing.title}</h4>
        )}
        {existing.body && (
          <p className="text-default-600 mt-1 text-sm leading-relaxed">
            {existing.body}
          </p>
        )}
      </div>
    );
  }

  if (existing && editing) {
    return (
      <div className="border-primary/2 bg-primary/5 mt-4 w-full rounded-2xl border p-5">
        <h4 className="text-primary mb-4 flex items-center gap-2 text-sm font-semibold">
          <PencilIcon className="h-4 w-4" /> Edit Your Review
        </h4>
        <ReviewForm
          defaultValues={{
            rating: existing.rating,
            title: existing.title ?? "",
            body: existing.body ?? "",
          }}
          isLoading={update.isPending}
          onCancel={() => setEditing(false)}
          submitLabel="Save Changes"
          onSubmit={async (values) => {
            const result = await update.mutateAsync({
              reviewId: existing.id,
              values,
            });
            if (result.success) setEditing(false);
          }}
        />
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="border-divider bg-background mt-4 rounded-2xl border p-5 shadow-sm">
        <h4 className="text-default-700 mb-4 flex items-center gap-2 text-sm font-semibold">
          <MessageSquarePlus className="text-primary h-4 w-4" /> Review{" "}
          {productName}
        </h4>
        <ReviewForm
          isLoading={create.isPending}
          onCancel={() => setShowForm(false)}
          onSubmit={async (values) => {
            const result = await create.mutateAsync({ orderItemId, values });
            if (result.success) setShowForm(false);
          }}
        />
        {create.data?.success === false && (
          <Alert color="danger" className="mt-3">
            {create.data.message}
          </Alert>
        )}
      </div>
    );
  }

  return (
    <div className="mt-3">
      <Button
        size="sm"
        // variant="flat"
        // color="primary"
        className="px-4 font-medium"
        // startContent={<StarIcon className="h-4 w-4" />}
        onPress={() => setShowForm(true)}
      >
        Write a review
      </Button>
    </div>
  );
}
