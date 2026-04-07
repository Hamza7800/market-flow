"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { X, Upload, Loader2, ImageIcon, GripVertical } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing-components";
import { useDropzone } from "react-dropzone";
import { toast } from "@heroui/react";
// import { deleteUploadThingFile } from "@/actions/images";

export interface UploadedImage {
  url: string;
  altText?: string;
  sortOrder: number;
  isPrimary: boolean;
  key: string;
}

interface MultiImageUploaderProps {
  value?: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  disabled?: boolean;
  className?: string;
  maxSize?: number;
  maxFiles?: number;
}

export function MultiImageUploader({
  value = [],
  onChange,
  disabled = false,
  className = "",
  maxSize = 4,
  maxFiles = 10,
}: MultiImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [uploadedKeys, setUploadedKeys] = useState<Record<string, string>>({});

  useEffect(() => {
    const map: Record<string, string> = {};

    value.forEach((img) => {
      map[img.url] = img.key;
    });

    setUploadedKeys(map);
  }, []);

  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      if (res && res.length > 0) {
        const newImages: UploadedImage[] = res.map((r, i) => ({
          url: r.ufsUrl,
          altText: "",
          sortOrder: value.length + i,
          isPrimary: value.length === 0 && i === 0,
          key: r.key,
        }));

        const keyMap: Record<string, string> = {};
        res.forEach((r) => {
          keyMap[r.ufsUrl] = r.key;
        });
        setUploadedKeys((prev) => ({ ...prev, ...keyMap }));

        onChange([...value, ...newImages]);
        toast.success(
          `${newImages.length} image${newImages.length > 1 ? "s" : ""} uploaded!`,
        );
      }
      setIsUploading(false);
      setUploadProgress(0);
    },
    onUploadError: (error: Error) => {
      toast.danger(`Upload failed: ${error.message}`);
      setIsUploading(false);
      setUploadProgress(0);
    },
    onUploadBegin: () => {
      setIsUploading(true);
      setUploadProgress(10);
    },
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length || disabled) return;

      const remaining = maxFiles - value.length;
      if (remaining <= 0) {
        toast.danger(`Maximum ${maxFiles} images allowed`);
        return;
      }

      const filesToUpload = acceptedFiles.slice(0, remaining);

      // Validate each file
      for (const file of filesToUpload) {
        if (file.size / 1024 / 1024 > maxSize) {
          toast.danger(`"${file.name}" exceeds ${maxSize}MB limit`);
          return;
        }
        if (!file.type.startsWith("image/")) {
          toast.danger(`"${file.name}" is not an image`);
          return;
        }
      }

      if (acceptedFiles.length > remaining) {
        toast.warning(
          `Only ${remaining} more image${remaining > 1 ? "s" : ""} allowed. Uploading first ${remaining}.`,
        );
      }

      await startUpload(filesToUpload);
    },
    [disabled, maxFiles, maxSize, value, startUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"] },
    maxFiles,
    disabled: disabled || isUploading || value.length >= maxFiles,
  });

  const handleDelete = async (image: UploadedImage) => {
    if (disabled) return;
    const key = uploadedKeys[image.url];
    try {
      if (key) {
        setDeletingKey(key);
        // const result = await deleteUploadThingFile(key);
        // if (result.success) {

        onChange(
          value
            .filter((img) => img.url !== image.url)
            .map((img, i) => ({ ...img, sortOrder: i })),
        );
        toast.success("Image removed");
        // } else {
        // toast.danger("Failed to remove image");
        // }
      }
    } catch {
      toast.danger("Failed to remove image");
    } finally {
      setDeletingKey(null);
    }
  };

  const canUploadMore = value.length < maxFiles && !isUploading && !disabled;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Image grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {value.map((image, index) => (
            <div
              key={image.url}
              className="group relative aspect-square overflow-hidden rounded-xl border border-[--border] bg-[--surface]"
            >
              <Image
                src={image.url}
                alt={`Image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {/* Index badge */}
              <div className="absolute top-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[10px] font-semibold text-white">
                {index + 1}
              </div>
              {/* Delete overlay */}
              {!disabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => handleDelete(image)}
                    disabled={deletingKey === image.url}
                    className="rounded-full bg-[--danger] p-2 text-white transition-colors hover:opacity-80 disabled:opacity-50"
                    aria-label="Remove image"
                  >
                    {deletingKey === image.url ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() =>
                  onChange(
                    value.map((img, i) => ({ ...img, isPrimary: i === index })),
                  )
                }
                className={`absolute bottom-1.5 left-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold transition-colors ${
                  image.isPrimary
                    ? "bg-[--accent] text-[--accent-foreground]"
                    : "bg-black/60 text-white opacity-0 group-hover:opacity-100"
                }`}
              >
                {image.isPrimary ? "Primary" : "Set primary"}
              </button>
            </div>
          ))}

          {/* Inline add more tile */}
          {canUploadMore && (
            <div
              {...getRootProps()}
              className={`flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
                isDragActive
                  ? "border-[--accent] bg-[--accent]/10"
                  : "border-[--border] bg-[--surface] hover:border-[--accent]/60 hover:bg-[--surface-secondary]"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mb-1 h-5 w-5 text-[--muted]" />
              <span className="text-center text-xs text-[--muted]">
                Add more
              </span>
            </div>
          )}
        </div>
      )}

      {/* Main dropzone — shown when no images yet */}
      {value.length === 0 && (
        <div
          {...getRootProps()}
          className={`relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
            isDragActive
              ? "border-[--accent] bg-[--accent]/10"
              : "border-[--border] bg-[--surface]"
          } ${disabled || isUploading ? "cursor-not-allowed opacity-60" : "hover:border-[--accent]/60 hover:bg-[--surface-secondary]"}`}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <div className="flex flex-col items-center gap-3 px-6">
              <Loader2 className="h-9 w-9 animate-spin text-[--accent]" />
              <div className="w-full max-w-xs">
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-[--foreground]">
                    Uploading...
                  </span>
                  <span className="text-[--muted]">{uploadProgress}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[--default]">
                  <div
                    className="h-full bg-[--accent] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 p-6 text-center">
              {isDragActive ? (
                <>
                  <Upload className="h-10 w-10 text-[--accent]" />
                  <p className="text-sm font-medium text-[--accent]">
                    Drop images here
                  </p>
                </>
              ) : (
                <>
                  <ImageIcon className="h-10 w-10 text-[--muted]" />
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-[--foreground]">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-[--muted]">
                      PNG, JPG, WEBP or GIF · up to {maxSize}MB each · max{" "}
                      {maxFiles} images
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Progress bar when uploading over existing images */}
      {isUploading && value.length > 0 && (
        <div className="rounded-xl border border-[--border] bg-[--surface] px-4 py-3">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium text-[--foreground]">
              <Loader2 className="h-4 w-4 animate-spin text-[--accent]" />
              Uploading...
            </span>
            <span className="text-[--muted]">{uploadProgress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[--default]">
            <div
              className="h-full bg-[--accent] transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Count indicator */}
      <p className="text-xs text-[--muted]">
        {value.length} / {maxFiles} images
        {value.length >= maxFiles && (
          <span className="ml-1 text-[--warning-foreground]">
            — maximum reached
          </span>
        )}
      </p>
    </div>
  );
}
