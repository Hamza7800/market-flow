import { Loader2, X, Upload, ImageIcon } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { CropperModal } from "./crop-modal";
import { useCropUploader, type UploadedImage } from "./single-image-upload";
import Image from "next/image";

interface BannerImageUploaderProps {
  value?: UploadedImage | null;
  onChange: (img: UploadedImage | null) => void;
  onUploadComplete?: (img: UploadedImage) => void;
  disabled?: boolean;
  className?: string;
  /** Aspect ratio for the banner crop, default 3:1 */
  aspect?: number;
  endpoint?: "imageUploader" | "profileImageUploader" | "bannerImageUploader";
}

export function BannerImageUploader({
  value,
  onChange,
  onUploadComplete,
  disabled = false,
  className = "",
  aspect = 3,
  endpoint = "imageUploader",
}: BannerImageUploaderProps) {
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
      {rawSrc && (
        <CropperModal
          imageSrc={rawSrc}
          isOpen={isCropperOpen}
          onClose={() => setIsCropperOpen(false)}
          onCropComplete={handleCropComplete}
          aspect={aspect}
          cropShape="rect"
          title="Crop Banner Image"
        />
      )}

      <div className={className}>
        <div
          {...getRootProps()}
          className={`relative flex w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors ${isDragActive ? "border-primary bg-primary/10" : "border-default-300 bg-default-100"} ${disabled || isUploading ? "cursor-not-allowed opacity-60" : "hover:border-default-400 hover:bg-default-200/50"} `}
          style={{ aspectRatio: `${aspect} / 1` }}
        >
          <input {...getInputProps()} />

          {value?.url && !isUploading ? (
            <>
              <Image
                src={value.url}
                alt="Banner"
                fill
                className="object-cover"
                sizes="100vw"
              />
              {/* Hover overlay with delete */}
              {!disabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                  <div className="flex gap-2">
                    {/* Re-upload hint */}
                    <span className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                      Click to replace
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                      }}
                      disabled={isDeleting}
                      className="bg-danger hover:bg-danger/80 rounded-full p-2 text-white transition-colors disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : isUploading ? (
            <div className="flex flex-col items-center gap-3 p-6">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
              <div className="w-full max-w-xs">
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-default-700 font-medium">
                    Uploading…
                  </span>
                  <span className="text-default-500">{uploadProgress}%</span>
                </div>
                <div className="bg-default-200 h-1.5 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 p-6 text-center">
              {isDragActive ? (
                <>
                  <Upload className="text-primary h-8 w-8" />
                  <p className="text-primary text-sm font-medium">
                    Drop your image here
                  </p>
                </>
              ) : (
                <>
                  <ImageIcon className="text-default-400 h-8 w-8" />
                  <div className="flex flex-col gap-0.5">
                    <p className="text-default-700 text-sm font-medium">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-default-400 text-xs">
                      PNG, JPG, WEBP · max 4MB · {aspect}:1 ratio
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
