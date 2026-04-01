import { useDropzone } from "react-dropzone";
import { useCropUploader, type UploadedImage } from "./single-image-upload";
import { CropperModal } from "./crop-modal";
import Image from "next/image";
import { Loader2, UserCircle2, X } from "lucide-react";

interface ProfileImageUploaderProps {
  value?: UploadedImage | null;
  onChange: (img: UploadedImage | null) => void;
  onUploadComplete?: (img: UploadedImage) => void;
  disabled?: boolean;
  className?: string;
  /** UploadThing endpoint to use (must accept the file) */
  endpoint?: "imageUploader" | "profileImageUploader" | "bannerImageUploader";
}

export function ProfileImageUploader({
  value,
  onChange,
  onUploadComplete,
  disabled = false,
  className = "",
  endpoint = "imageUploader",
}: ProfileImageUploaderProps) {
  const {
    rawSrc,
    isCropperOpen,
    setIsCropperOpen,
    isUploading,
    uploadProgress,
    isDeleting,
    openCropper,
    handleCropComplete,
    handleDelete,
  } = useCropUploader({ value, onChange, onUploadComplete, disabled });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: openCropper,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 1,
    disabled: disabled || isUploading,
  });

  return (
    <>
      {/* Cropper modal */}
      {rawSrc && (
        <CropperModal
          imageSrc={rawSrc}
          isOpen={isCropperOpen}
          onClose={() => setIsCropperOpen(false)}
          onCropComplete={handleCropComplete}
          aspect={1}
          cropShape="round"
          title="Crop Profile Photo"
        />
      )}

      <div className={`flex flex-col items-center gap-3 ${className}`}>
        {/* Avatar preview / upload target */}
        <div
          {...getRootProps()}
          className={`relative h-24 w-24 cursor-pointer rounded-full border-2 border-dashed transition-colors ${isDragActive ? "border-primary bg-primary/10" : "border-default-300 bg-default-100"} ${disabled || isUploading ? "cursor-not-allowed opacity-60" : "hover:border-default-400"} `}
        >
          <input {...getInputProps()} />

          {value?.url && !isUploading ? (
            <Image
              src={value.url}
              alt="Profile photo"
              fill
              className="rounded-full object-cover"
              sizes="96px"
            />
          ) : isUploading ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-full">
              <Loader2 className="text-primary h-6 w-6 animate-spin" />
              <span className="text-default-500 text-[10px]">
                {uploadProgress}%
              </span>
            </div>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-full">
              <UserCircle2 className="text-default-400 h-8 w-8" />
              <span className="text-default-500 text-[10px] font-medium">
                {isDragActive ? "Drop" : "Upload"}
              </span>
            </div>
          )}

          {/* Delete button overlay */}
          {value?.url && !isUploading && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-danger hover:bg-danger/80 absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-white shadow transition-opacity disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <X className="h-3 w-3" />
              )}
            </button>
          )}
        </div>

        <p className="text-default-500 text-xs">
          {value?.url ? "Click or drag to replace" : "PNG, JPG, WEBP · max 4MB"}
        </p>
      </div>
    </>
  );
}
