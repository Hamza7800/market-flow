import { createContext, useEffect, useState, type ReactNode } from "react";

import type { VendorProfileType } from "@/actions/vendor";
import { useVendorProfile } from "@/hooks/use-vedor";
import { authClient } from "@/server/better-auth/client";

export type VendorContextValue = {
  loading: boolean;
  isVendor: boolean;
  isPending: boolean;
  isActive: boolean;
  isSuspended: boolean;
  isStripeConnected: boolean;
  profile: VendorProfileType["data"] | null;
  refresh: () => void;
};

export const VendorContext = createContext<VendorContextValue | null>(null);

export const VendorProvider = ({ children }: { children: ReactNode }) => {
  const { data: userData } = authClient.useSession();
  const userId = userData?.user.id;
  const { data, isPending, refetch } = useVendorProfile(userId);

  const value: VendorContextValue = {
    loading: isPending,
    isVendor: !!data?.id,
    isPending: data?.status === "pending",
    isActive: data?.status === "active",
    isSuspended: data?.status === "suspended",
    isStripeConnected: data?.stripeOnboardingComplete ?? false,
    profile: data,
    refresh: refetch,
  };

  return (
    <VendorContext.Provider value={value}>{children}</VendorContext.Provider>
  );
};
