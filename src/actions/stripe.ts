"use server";

import { env } from "@/env";
import { cacheDel } from "@/lib/cache-helpers";
import { vendorKeys } from "@/lib/cache-keys";
import { stripeClient } from "@/server/better-auth/config";
import { getUser } from "@/server/better-auth/server";
import { db } from "@/server/db";
import { vendorProfiles } from "@/server/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import type Stripe from "stripe";

export const requireVendorProfile = async () => {
  const user = await getUser();

  const vendor = await db.query.vendorProfiles.findFirst({
    where: and(
      eq(vendorProfiles.userId, user.id),
      isNull(vendorProfiles.deletedAt),
    ),
  });

  if (!vendor) {
    return {
      success: false,
      message: "Vendor profile not found",
      data: null,
    };
  }

  return {
    success: true,
    vendor,
    user,
    message: null,
    data: null,
  };
};

export const createConnectAccount = async () => {
  const result = await requireVendorProfile();
  if (!result.success) {
    return {
      success: false,
      message: result.message,
      data: null,
    };
  }

  const { user, vendor } = result;

  if (!user && !vendor) {
    return {
      success: false,
      message: "Unable to connect with stripe right now",
      data: null,
    };
  }

  try {
    let stripeAccountId = vendor?.stripeAccountId;

    if (!stripeAccountId) {
      const account = await stripeClient.accounts.create({
        type: "express",
        email: user?.email,
        business_profile: {
          name: vendor?.storeName,
          // url: `${env.NEXT_PUBLIC_APP_URL}/vendor/${vendor?.id}/dashboard`,
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          vendorId: vendor.id,
          userId: user.id,
          storeSlug: vendor.storeSlug,
        },
      });

      stripeAccountId = account.id;

      await db
        .update(vendorProfiles)
        .set({
          stripeAccountId,
          updatedAt: new Date(),
        })
        .where(eq(vendorProfiles.id, vendor.id));

      cacheDel(
        vendorKeys.tags.byUser(user.id),
        vendorKeys.tags.detail(vendor.id),
      );
    }

    const linkResult = await _createOnboardingLink(stripeAccountId, vendor.id);
    if (!linkResult.success) {
      return { success: false, message: linkResult.message, data: null };
    }

    return {
      success: true,
      message: "Stripe account created",
      data: { url: linkResult.url, stripeAccountId },
    };
  } catch (error) {
    console.error("[createConnectAccount]", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create Stripe account",
      data: null,
    };
  }
};

const _createOnboardingLink = async (
  stripeAccountId: string,
  vendorId: string,
) => {
  try {
    const baseUrl = env.NEXT_PUBLIC_APP_URL;
    const accountLink = await stripeClient.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${baseUrl}/vendor/${vendorId}/dashboard/stripe`,
      return_url: `${baseUrl}/vendor/${vendorId}/dashboard/stripe`,
      type: "account_onboarding",
    });

    return {
      success: true,
      message: "Account Link",
      url: accountLink.url,
    };
  } catch (error) {
    console.error("[createOnboardingLink]", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create onboarding link",
    };
  }
};

export const createOnboardingLink = async () => {
  const result = await requireVendorProfile();
  if (!result.success) {
    return { success: false, message: result.message, data: null };
  }
  const { vendor } = result;
  if (!vendor) {
    return {
      success: false,
      message: "Unable to connect with stripe right now",
      data: null,
    };
  }

  if (!vendor.stripeAccountId) {
    return {
      success: false,
      message:
        "No Stripe account found. Please start the Connect flow from the beginning.",
      data: null,
    };
  }

  try {
    const linkResult = await _createOnboardingLink(
      vendor.stripeAccountId,
      vendor.storeSlug,
    );

    if (!linkResult.success) {
      return { success: false, message: linkResult.message, data: null };
    }

    return {
      success: true,
      message: "Onboarding link created",
      data: { url: linkResult.url },
    };
  } catch (error) {
    console.error("[createOnboardingLink]", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to generate onboarding link",
      data: null,
    };
  }
};

export const syncConnectAccountStatus = async (stripeAccountId: string) => {
  try {
    const account = await stripeClient.accounts.retrieve(stripeAccountId);
    const onboardingComplete =
      account.charges_enabled === true &&
      account.payouts_enabled === true &&
      account.details_submitted === true;

    await db
      .update(vendorProfiles)
      .set({
        stripeOnboardingComplete: onboardingComplete,
        updatedAt: new Date(),
      })
      .where(eq(vendorProfiles.stripeAccountId, stripeAccountId));

    const vendor = await db.query.vendorProfiles.findFirst({
      where: eq(vendorProfiles.stripeAccountId, stripeAccountId),
      columns: { userId: true, id: true },
    });

    if (vendor) {
      cacheDel(
        vendorKeys.tags.byUser(vendor.userId),
        vendorKeys.tags.detail(vendor.id),
        vendorKeys.tags.all(),
      );
    }

    return {
      success: true,
      message: onboardingComplete
        ? "Stripe onboarding complete"
        : "Stripe account updated — onboarding still incomplete",
      data: { onboardingComplete },
    };
  } catch (error) {
    console.error("[syncConnectAccountStatus]", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to sync Stripe status",
      data: null,
    };
  }
};

export const handleAccountUpdated = async (account: Stripe.Account) => {
  await syncConnectAccountStatus(account.id);
  console.log(
    `[stripe-webhook] account.updated → ${account.id}`,
    `charges_enabled=${account.charges_enabled}`,
    `payouts_enabled=${account.payouts_enabled}`,
  );
};

export const handleAccountDeauthorized = async (stripeAccountId: string) => {
  const vendor = await db.query.vendorProfiles.findFirst({
    where: eq(vendorProfiles.stripeAccountId, stripeAccountId),
    columns: { id: true, userId: true },
  });

  if (!vendor) {
    console.warn(
      `[stripe-webhook] account.application.deauthorized — no vendor found for ${stripeAccountId}`,
    );
    return;
  }

  await db
    .update(vendorProfiles)
    .set({
      stripeAccountId: null,
      stripeOnboardingComplete: false,
      updatedAt: new Date(),
    })
    .where(eq(vendorProfiles.id, vendor.id));

  cacheDel(
    vendorKeys.tags.byUser(vendor.userId),
    vendorKeys.tags.detail(vendor.id),
    vendorKeys.tags.all(),
  );

  console.log(
    `[stripe-webhook] account.application.deauthorized → vendor ${vendor.id} disconnected`,
  );
};
