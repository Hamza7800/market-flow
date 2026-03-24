import { createRouteHandler } from "uploadthing/next";
import { imageFileRouter } from "@/lib/uploadthing";

export const { GET, POST } = createRouteHandler({
  router: imageFileRouter,
});
