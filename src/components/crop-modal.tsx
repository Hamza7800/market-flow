"use client";

import { useState, useCallback } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Modal, Button, Slider } from "@heroui/react";
import { ZoomIn, ZoomOut, RotateCw } from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────────────────

async function getCroppedBlob(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  outputType: "image/jpeg" | "image/png" | "image/webp" = "image/jpeg",
  quality = 0.92,
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);
  ctx.drawImage(
    image,
    safeArea / 2 - image.width / 2,
    safeArea / 2 - image.height / 2,
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width / 2 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height / 2 - pixelCrop.y),
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas toBlob failed"));
      },
      outputType,
      quality,
    );
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.setAttribute("crossOrigin", "anonymous");
    img.src = url;
  });
}

// ─── types ───────────────────────────────────────────────────────────────────

export type CropShape = "rect" | "round";

interface CropperModalProps {
  /** Raw object-URL or data-URL of the image to crop */
  imageSrc: string;
  isOpen: boolean;
  onClose: () => void;
  /** Called with the cropped Blob when the user confirms */
  onCropComplete: (blob: Blob) => void;
  /** Width / Height ratio, e.g. 1 for square, 3 for banner */
  aspect?: number;
  cropShape?: CropShape;
  title?: string;
  outputType?: "image/jpeg" | "image/png" | "image/webp";
  quality?: number;
}

export function CropperModal({
  imageSrc,
  isOpen,
  onClose,
  onCropComplete,
  aspect = 1,
  cropShape = "rect",
  title = "Crop Image",
  outputType = "image/jpeg",
  quality = 0.92,
}: CropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  const handleCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setIsCropping(true);
    try {
      const blob = await getCroppedBlob(
        imageSrc,
        croppedAreaPixels,
        rotation,
        outputType,
        quality,
      );
      onCropComplete(blob);
      onClose();
    } finally {
      setIsCropping(false);
    }
  };

  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.Header className="text-base font-semibold">
              {title}
            </Modal.Header>

            <Modal.Body>
              <div className="relative h-[260px] w-full bg-black/90">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={aspect}
                  cropShape={cropShape}
                  showGrid={cropShape !== "round"}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={handleCropComplete}
                  classes={{
                    containerClassName: "!rounded-none",
                    cropAreaClassName:
                      "!border-2 !border-white/80 !shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]",
                  }}
                />
              </div>

              {/* Controls */}
              <div className="flex flex-col gap-4 px-6 py-4">
                <div className="flex items-center gap-3">
                  <ZoomOut className="text-default-500 h-4 w-4 shrink-0" />
                  <Slider
                    aria-label="Zoom"
                    minValue={1}
                    maxValue={3}
                    step={0.05}
                    value={zoom}
                    onChange={(value) => setZoom(value as number)}
                  >
                    <Slider.Track>
                      <Slider.Fill />
                      <Slider.Thumb />
                    </Slider.Track>
                  </Slider>
                  <ZoomIn className="text-default-500 h-4 w-4 shrink-0" />
                </div>
              </div>
            </Modal.Body>

            <Modal.Footer className="gap-2">
              <Button size="sm" onPress={handleRotate}>
                <RotateCw className="h-4 w-4" />
                Rotate
              </Button>
              <div className="flex-1" />
              {/* slot="close" handles closing via HeroUI internally */}
              <Button slot="close" variant="secondary" isDisabled={isCropping}>
                Cancel
              </Button>
              <Button
                onPress={handleConfirm}
                // isLoading={isCropping}
              >
                Crop & Upload
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
