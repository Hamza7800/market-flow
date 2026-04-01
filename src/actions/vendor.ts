"use server";

import { cacheDel, cacheWrap } from "@/lib/cache-helpers";
import { vendorKeys } from "@/lib/cache-keys";
import { returnError } from "@/lib/utils";
import { getUser } from "@/server/better-auth/server";
import { db } from "@/server/db";
import { vendorProfiles } from "@/server/db/schema";
import {
  vendorSchema,
  type VendorSchema,
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

export const submitVendorApplication = async (values: VendorSchema) => {
  try {
    const user = await getUser();
    const validatedValues = vendorSchema.safeParse(values);

    if (validatedValues.error) {
      return {
        success: false,
        message: validatedValues.error.message,
        data: null,
      };
    }

    const { storeName, description, banner, logo, returnPolicy, contactEmail } =
      validatedValues.data;

    const [application] = await db
      .insert(vendorProfiles)
      .values({
        storeName,
        description,
        storeSlug: await generateStoreSlug(storeName),
        userId: user.id,
        contactEmail,
        returnPolicy,
        status: "active",
        bannerKey: banner.key,
        bannerUrl: banner.url,
        logoUrl: logo.url,
        logoKey: logo.key,
      })
      .returning();

    cacheDel(vendorKeys.tags.byUser(user.id), vendorKeys.tags.all());

    return {
      success: true,
      message: "Application Submitted",
      data: application,
    };
  } catch (error) {
    return returnError(error, "Unable to submit application");
  }
};

export type VendorRow = typeof vendorProfiles.$inferSelect;

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

    if (!profile) {
      return {
        success: false,
        data: null,
        message: "No Active Vendor",
      };
    }

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

export const updateVendor = async (values: VendorSchema) => {
  try {
    const user = await getUser();
    const parsed = vendorSchema.parse(values);

    const { storeName, description, logo, banner, contactEmail, returnPolicy } =
      parsed;

    const vendor = await db.query.vendorProfiles.findFirst({
      where: and(
        eq(vendorProfiles.userId, user.id),
        eq(vendorProfiles.status, "active"),
        isNull(vendorProfiles.deletedAt),
      ),
      columns: { id: true },
    });
    if (!vendor)
      return {
        success: false,
        data: null,
        message: "Vendor profile not found",
      };

    const updatePayload: Partial<typeof vendorProfiles.$inferInsert> = {
      storeName,
      description: description ?? null,
      logoUrl: logo?.url ?? null,
      logoKey: logo?.key ?? null,
      bannerUrl: banner?.url ?? null,
      bannerKey: banner?.key ?? null,
      contactEmail: contactEmail ?? null,
      returnPolicy: returnPolicy ?? null,
    };

    const [updated] = await db
      .update(vendorProfiles)
      .set(updatePayload)
      .where(eq(vendorProfiles.id, vendor.id))
      .returning();

    if (!updated) {
      return {
        success: false,
        message: "Vendor profile not found",
        data: null,
      };
    }

    cacheDel(vendorKeys.tags.byUser(user.id), vendorKeys.tags.all());

    return {
      success: true,
      message: "Store profile updated successfully",
      data: updated,
    };
  } catch (error) {
    return returnError(error, "Something went wrong. Please try again.");
  }
};

export const isVendor = async () => {
  try {
    const user = await getUser();
    const vendor = await db.query.vendorProfiles.findFirst({
      where: and(
        eq(vendorProfiles.userId, user.id),
        eq(vendorProfiles.status, "active"),
        isNull(vendorProfiles.deletedAt),
      ),
      columns: { id: true },
    });
    if (!vendor)
      return {
        success: false,
        data: null,
        message: "Vendor profile not found",
      };
    return {
      success: true,
      data: vendor,
      message: "Vendor Profile",
    };
  } catch (error) {
    return returnError(error, "Unable to find vendor profile.");
  }
};
