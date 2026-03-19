import { getVendorProfile, submitVendorApplication } from "@/actions/vendor";
import {
  VendorContext,
  type VendorContextValue,
} from "@/components/context/vendor-context";
import { vendorKeys } from "@/lib/cache-keys";
import { authClient } from "@/server/better-auth/client";
import type { StoreSchema } from "@/zod-schema/vendor-profile-schema";
import { toast } from "@heroui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useContext } from "react";

export const useVendorApplication = () => {
  return useMutation({
    mutationFn: async (values: StoreSchema) => {
      const result = await submitVendorApplication(values);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (result) => {
      toast.success(result?.message);
    },
    onError: (error) => {
      toast.danger(error?.message);
    },
  });
};

export function useVendor(): VendorContextValue {
  const ctx = useContext(VendorContext);
  if (!ctx) {
    throw new Error("useVendor must be used inside <VendorProvider>");
  }
  return ctx;
}

export const useVendorProfile = (userId?: string) => {
  return useQuery({
    queryKey: vendorKeys.byUser(userId ?? "no-user"),
    queryFn: async () => {
      const result = await getVendorProfile();
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!userId,
  });
};
