import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/server/better-auth";
import { headers } from "next/headers";

const f = createUploadthing();

async function getAuthUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new UploadThingError("Unauthorized");
  }

  return session.user;
}

export const imageFileRouter = {
  imageUploader: f({
    image: {
      maxFileCount: 10,
      maxFileSize: "4MB",
    },
  })
    .middleware(async () => {
      const user = await getAuthUser();
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.ufsUrl);
      console.log("File key:", file.key);

      return {
        uploadedBy: metadata.userId,
        url: file.ufsUrl,
        key: file.key,
        name: file.name,
        size: file.size,
      };
    }),
} satisfies FileRouter;

export type ImageFileRouter = typeof imageFileRouter;
