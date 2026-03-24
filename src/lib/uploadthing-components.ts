import {
  generateUploadButton,
  generateUploadDropzone,
  generateReactHelpers,
} from "@uploadthing/react";
import type { ImageFileRouter } from "./uploadthing";

export const UploadButton = generateUploadButton<ImageFileRouter>();
export const UploadDropzone = generateUploadDropzone<ImageFileRouter>();

export const { useUploadThing } = generateReactHelpers<ImageFileRouter>();
