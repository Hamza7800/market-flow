import {
  createConnectAccount,
  createOnboardingLink,
  syncConnectAccountStatus,
} from "@/actions/stripe";
import { useVendor } from "@/hooks/use-vedor";
import { useMutation } from "@tanstack/react-query";
// import { useRouter } from "nextjs-toploader/app";

export type StripeConnectState =
  | "idle"
  | "pending"
  | "connected"
  | "loading"
  | "error";

export const useStripeConnect = () => {
  const { profile, refresh } = useVendor();
  // const router = useRouter();

  // const isAnyLoading = false;

  const baseState: StripeConnectState = !profile?.stripeAccountId
    ? "idle"
    : profile.stripeOnboardingComplete
      ? "connected"
      : "pending";

  const redirectToStripe = (url: string) => {
    window.location.href = url;
  };

  const connectMutation = useMutation({
    mutationFn: async () => {
      const result = await createConnectAccount();
      if (!result.success || !result.data) {
        throw new Error(result.message || "Failed to create account");
      }
      return result.data;
    },
    onSuccess: (data) => {
      if (data.url) {
        redirectToStripe(data.url);
      }
    },
  });

  const resumeMutation = useMutation({
    mutationFn: async () => {
      const result = await createOnboardingLink();
      if (!result.success || !result.data) {
        throw new Error(result.message || "Failed to resume onboarding");
      }
      return result.data;
    },
    onSuccess: (data) => {
      if (data.url) {
        redirectToStripe(data.url);
      }
    },
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.stripeAccountId) return null;

      const result = await syncConnectAccountStatus(profile.stripeAccountId);

      if (!result.success || !result.data) {
        throw new Error(result.message || "Failed to sync");
      }

      return result.data;
    },
    onSuccess: () => {
      refresh();
    },
  });

  const isLoading =
    connectMutation.isPending ||
    resumeMutation.isPending ||
    syncMutation.isPending;

  const error =
    connectMutation.error?.message ||
    resumeMutation.error?.message ||
    syncMutation.error?.message ||
    null;

  const state: StripeConnectState = isLoading
    ? "loading"
    : error
      ? "error"
      : baseState;

  return {
    state,
    error,
    isLoading,

    connect: connectMutation.mutateAsync,
    resume: resumeMutation.mutateAsync,
    sync: syncMutation.mutateAsync,
  };
};
