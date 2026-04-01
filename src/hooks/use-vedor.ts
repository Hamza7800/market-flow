import {
  getVendorProfile,
  submitVendorApplication,
  updateVendor,
} from "@/actions/vendor";
import {
  VendorContext,
  type VendorContextValue,
} from "@/components/context/vendor-context";
import { vendorKeys } from "@/lib/cache-keys";
import { authClient } from "@/server/better-auth/client";
import type { VendorSchema } from "@/zod-schema/vendor-profile-schema";
import { toast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";

export const useVendorApplication = () => {
  const qc = useQueryClient();
  const { data } = authClient.useSession();
  const userId = data?.user.id;

  return useMutation({
    mutationFn: async (values: VendorSchema) => {
      const result = await submitVendorApplication(values);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (result) => {
      toast.success(result?.message);
    },
    onSettled: () => {
      qc.invalidateQueries({
        queryKey: vendorKeys.byUser(userId ?? "no-user"),
      });
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
    // enabled: !!userId,
  });
};

export function useUpdateVendor() {
  const { data } = authClient.useSession();
  const queryClient = useQueryClient();
  const userId = data?.user.id;

  return useMutation({
    mutationFn: async (values: VendorSchema) => {
      const result = await updateVendor(values);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: () => {
      toast.success("Store profile updated");
      queryClient.invalidateQueries({
        queryKey: vendorKeys.byUser(userId ?? "no-user"),
      });
    },
    onError: (error: Error) => {
      toast.danger(error.message);
    },
  });
}
