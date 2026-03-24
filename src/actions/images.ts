"use server";

import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function deleteUploadThingFile(fileKey: string) {
  try {
    await utapi.deleteFiles(fileKey);
    return { success: true };
  } catch (error) {
    console.error("Error deleting file:", error);
    return { success: false, error: "Failed to delete file" };
  }
}

export async function deleteUploadThingFiles(fileKeys: string[]) {
  try {
    await utapi.deleteFiles(fileKeys);
    return { success: true };
  } catch (error) {
    console.error("Error deleting files:", error);
    return { success: false, error: "Failed to delete files" };
  }
}
