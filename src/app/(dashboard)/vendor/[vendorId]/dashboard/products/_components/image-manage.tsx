"use client";

import type { CreateProductSchema } from "@/zod-schema/product-schema";
import { Button, FieldError, Input, Label, TextField } from "@heroui/react";
import { ImageIcon, StarIcon, TrashIcon, PlusIcon } from "lucide-react";
import { Controller, type UseFormReturn } from "react-hook-form";

type Props = {
  form: UseFormReturn<CreateProductSchema>;
  fields: Record<"id", string>[];
  onAppend: () => void;
  onRemove: (index: number) => void;
  onSetPrimary: (index: number) => void;
};

export function ImageManager({
  form,
  fields,
  onAppend,
  onRemove,
  onSetPrimary,
}: Props) {
  const {
    register,
    formState: { errors },
    watch,
  } = form;
  const images = watch("images");

  return (
    <div className="space-y-3">
      {fields.length === 0 ? (
        <div className="border-border bg-surface/50 flex flex-col items-center justify-center rounded-xl border border-dashed py-10 text-center">
          <div className="bg-surface mb-3 flex h-12 w-12 items-center justify-center rounded-full">
            <ImageIcon className="text-muted-foreground h-5 w-5" />
          </div>
          <p className="text-foreground text-sm font-medium">No images yet</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Add at least one image — the first will be the primary.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {fields.map((field, index) => {
            const imageUrl = images?.[index]?.url;
            const isPrimary = images?.[index]?.isPrimary;

            return (
              <div
                key={field.id}
                className={[
                  "group relative flex items-start gap-3 rounded-xl border p-3 transition-colors",
                  isPrimary
                    ? "border-primary/40 bg-primary/5"
                    : "border-border bg-surface",
                ].join(" ")}
              >
                {/* Preview thumbnail */}
                <div className="border-border relative mt-0.5 h-16 w-16 shrink-0 overflow-hidden rounded-lg border">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={`Image ${index + 1}`}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon className="text-muted-foreground h-5 w-5" />
                    </div>
                  )}
                  {isPrimary && (
                    <div className="bg-primary/80 text-primary-foreground absolute inset-x-0 bottom-0 py-0.5 text-center text-[10px] font-semibold tracking-wide uppercase">
                      Primary
                    </div>
                  )}
                </div>

                {/* Fields */}
                <div className="min-w-0 flex-1 space-y-2">
                  <TextField
                    isInvalid={!!errors.images?.[index]?.url}
                    className="w-full"
                  >
                    <Label className="text-muted-foreground text-xs">
                      Image URL
                    </Label>
                    <Input
                      {...register(`images.${index}.url`)}
                      placeholder="https://example.com/image.jpg"
                      className="h-8 text-sm"
                    />
                    <FieldError>
                      {errors.images?.[index]?.url?.message}
                    </FieldError>
                  </TextField>

                  <TextField className="w-full">
                    <Label className="text-muted-foreground text-xs">
                      Alt text
                    </Label>
                    <Input
                      {...register(`images.${index}.altText`)}
                      placeholder="Describe this image for accessibility"
                      className="h-8 text-sm"
                    />
                  </TextField>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 flex-col gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    isIconOnly
                    onPress={() => onSetPrimary(index)}
                    isDisabled={isPrimary}
                    className={[
                      "h-7 w-7",
                      isPrimary
                        ? "text-primary"
                        : "text-muted-foreground hover:text-warning",
                    ].join(" ")}
                    aria-label="Set as primary image"
                  >
                    <StarIcon
                      className="h-3.5 w-3.5"
                      fill={isPrimary ? "currentColor" : "none"}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    isIconOnly
                    onPress={() => onRemove(index)}
                    className="text-muted-foreground hover:text-danger h-7 w-7"
                    aria-label="Remove image"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {fields.length < 10 && (
        <Button
          variant="outline"
          size="sm"
          onPress={onAppend}
          className="w-full border-dashed"
        >
          Add image
          <span className="text-muted-foreground ml-1">
            ({fields.length}/10)
          </span>
        </Button>
      )}

      {errors.images?.root && (
        <p className="text-danger text-xs">{errors.images.root.message}</p>
      )}
    </div>
  );
}
