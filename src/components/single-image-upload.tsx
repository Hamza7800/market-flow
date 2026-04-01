"use client";

import { useState, useCallback, useRef } from "react";
import { deleteUploadThingFile } from "@/actions/images";
import { useUploadThing } from "@/lib/uploadthing-components";
import { toast } from "@heroui/react";

export interface UploadedImage {
  url: string;
  key: string;
}

export function useCropUploader({
  value,
  onChange,
  onUploadComplete,
  disabled = false,
  maxSizeMB = 4,
  // endpoint,
}: {
  value?: UploadedImage | null;
  onChange: (img: UploadedImage | null) => void;
  onUploadComplete?: (img: UploadedImage) => void;
  disabled?: boolean;
  maxSizeMB?: number;
  // endpoint: "imageUploader" | "profileImageUploader" | "bannerImageUploader";
}) {
  const [rawSrc, setRawSrc] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const pendingBlobRef = useRef<Blob | null>(null);

  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      if (res?.[0]) {
        const uploaded: UploadedImage = {
          url: res[0].ufsUrl,
          key: res[0].key,
        };
        onChange(uploaded);
        onUploadComplete?.(uploaded);
        toast.success("Image uploaded successfully!");
      }
      setIsUploading(false);
      setUploadProgress(0);
    },
    onUploadError: (err) => {
      toast.danger(`Upload failed: ${err.message}`);
      setIsUploading(false);
      setUploadProgress(0);
    },
    onUploadBegin: () => {
      setIsUploading(true);
      setUploadProgress(10);
    },
    onUploadProgress: (p) => setUploadProgress(p),
  });

  /** Called by dropzone / file input — opens the cropper */
  const openCropper = useCallback(
    async (files: File[]) => {
      if (!files.length || disabled) return;
      const file = files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast.danger("Only image files are allowed");
        return;
      }
      if (file.size / 1024 / 1024 > maxSizeMB) {
        toast.danger(`File must be under ${maxSizeMB}MB`);
        return;
      }

      // Revoke previous objectURL if any
      if (rawSrc) URL.revokeObjectURL(rawSrc);
      setRawSrc(URL.createObjectURL(file));
      setIsCropperOpen(true);
    },
    [disabled, maxSizeMB, rawSrc],
  );

  /** Called when user confirms crop — uploads the cropped blob */
  const handleCropComplete = useCallback(
    async (blob: Blob) => {
      pendingBlobRef.current = blob;

      // Delete old image before uploading new one
      if (value?.key) {
        try {
          await deleteUploadThingFile(value.key);
        } catch {
          // non-fatal
        }
      }

      const croppedFile = new File([blob], `cropped-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      await startUpload([croppedFile]);
    },
    [value, startUpload],
  );

  const handleDelete = useCallback(async () => {
    if (!value?.key || disabled) return;
    setIsDeleting(true);
    try {
      const result = await deleteUploadThingFile(value.key);
      if (result.success) {
        onChange(null);
        toast.success("Image deleted successfully!");
      } else {
        toast.danger("Failed to delete image");
      }
    } catch {
      toast.danger("Failed to delete image");
    } finally {
      setIsDeleting(false);
    }
  }, [value, disabled, onChange]);

  return {
    rawSrc,
    isCropperOpen,
    setIsCropperOpen,
    isUploading,
    uploadProgress,
    isDeleting,
    openCropper,
    handleCropComplete,
    handleDelete,
  };
}
