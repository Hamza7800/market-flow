"use server";

import { cacheWrap } from "@/lib/cache-helpers";
import { vendorKeys } from "@/lib/cache-keys";
import { returnError } from "@/lib/utils";
import { getUser } from "@/server/better-auth/server";
import { db } from "@/server/db";
import { vendorProfiles } from "@/server/db/schema";
import {
  storeSchema,
  type StoreSchema,
} from "@/zod-schema/vendor-profile-schema";
import { and, eq, isNull } from "drizzle-orm";

export async function generateStoreSlug(storeName: string): Promise<string> {
  return storeName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export const submitVendorApplication = async (values: StoreSchema) => {
  try {
    const user = await getUser();
    const validatedValues = storeSchema.safeParse(values);

    if (validatedValues.error) {
      return {
        success: false,
        message: validatedValues.error.message,
        data: null,
      };
    }

    const { storeName, description, returnPolicy, contactEmail } =
      validatedValues.data;

    const [application] = await db
      .insert(vendorProfiles)
      .values({
        storeName,
        description,
        storeSlug: await generateStoreSlug(storeName),
        userId: user.id,
        contactEmail,
        status: "active",
      })
      .returning();

    return {
      success: true,
      message: "Application Submitted",
      data: application,
    };
  } catch (error) {
    return returnError(error, "Unable to submit application");
  }
};

export const getVendorProfile = async () => {
  try {
    const user = await getUser();
    const profile = await cacheWrap(
      vendorKeys.tags.byUser(user.id),
      [vendorKeys.tags.byUser(user.id), vendorKeys.tags.all()],
      async () => {
        return await db.query.vendorProfiles.findFirst({
          where: and(
            eq(vendorProfiles.userId, user.id),
            isNull(vendorProfiles.deletedAt),
          ),
        });
      },
      120,
    );

    return {
      success: true,
      data: profile,
      message: "User Vendor Profile",
    };
  } catch (error) {
    return returnError(error, "Unable to get vendor profile");
  }
};

export type VendorProfileType = Awaited<ReturnType<typeof getVendorProfile>>;
