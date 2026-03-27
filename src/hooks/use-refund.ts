import {
  approveItemRefund,
  getVendorRefundRequests,
  rejectItemRefund,
  requestItemRefund,
} from "@/actions/stripe";
import { orderKeys } from "@/lib/cache-keys";
import { authClient } from "@/server/better-auth/client";
import { toast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useVendor } from "./use-vedor";

export const useRequestItemRefund = (orderId: string) => {
  const qc = useQueryClient();
  const { data } = authClient.useSession();
  const userId = data?.user.id;

  return useMutation({
    mutationFn: async (orderItemId: string) => {
      const result = await requestItemRefund(orderItemId);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onMutate: async (orderItemId) => {
      await qc.cancelQueries({ queryKey: orderKeys.detail(orderId) });
      const snapshot = qc.getQueryData(orderKeys.detail(orderId));
      qc.setQueryData(orderKeys.detail(orderId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item: any) =>
            item.id === orderItemId
              ? {
                  ...item,
                  status: "cancelled",
                }
              : item,
          ),
        };
      });

      return { snapshot };
    },

    onError: (error, _id, ctx) => {
      if (ctx?.snapshot !== undefined) {
        qc.setQueryData(orderKeys.detail(orderId), ctx.snapshot);
        toast.danger(error.message);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
      qc.invalidateQueries({ queryKey: orderKeys.byUser(userId ?? "no-user") });
    },

    onSuccess: () => {
      toast.success(
        "Refund requested. The vendor will review and process your refund.",
      );
    },
  });
};

const REFUND_REQUESTS_KEY = ["vendor", "refund-requests"] as const;

export function useVendorRefundRequests(
  status: "pending" | "succeeded" | "failed" | "refunded",
) {
  const { profile } = useVendor();
  const vendorId = profile?.id;
  return useQuery({
    queryKey: [...REFUND_REQUESTS_KEY, vendorId, status],
    queryFn: async () => {
      const result = await getVendorRefundRequests(status);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!vendorId,
  });
}

export const useApproveItemRefund = () => {
  const { profile } = useVendor();
  const qc = useQueryClient();
  const vendorId = profile?.id;

  return useMutation({
    mutationFn: async (refundId: string) => {
      const result = await approveItemRefund(refundId);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onMutate: async (refundId) => {
      await qc.cancelQueries({ queryKey: [...REFUND_REQUESTS_KEY, vendorId] });
      const snapshot = qc.getQueryData([...REFUND_REQUESTS_KEY, vendorId]);

      qc.setQueryData(
        [...REFUND_REQUESTS_KEY, vendorId],
        (old: any[]) => old?.filter((r) => r.id !== refundId) ?? [],
      );
      console.log(snapshot);
      return { snapshot };
    },

    onError: (error, _id, ctx) => {
      if (ctx?.snapshot !== undefined) {
        qc.setQueryData([...REFUND_REQUESTS_KEY, vendorId], ctx.snapshot);
      }
      toast.danger(error.message);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: [...REFUND_REQUESTS_KEY, vendorId] });
      qc.invalidateQueries({
        queryKey: orderKeys.byVendor(vendorId ?? "no-vendor"),
      });
    },
    onSuccess: () => {
      toast.success(
        "Refund approved. Customer will receive funds in 5–10 business days.",
      );
    },
  });
};

export function useRejectItemRefund() {
  const { profile } = useVendor();
  const qc = useQueryClient();
  const vendorId = profile?.id;

  return useMutation({
    mutationFn: async ({
      refundId,
      reason,
    }: {
      refundId: string;
      reason?: string;
    }) => {
      const result = await rejectItemRefund(refundId, reason);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },

    onMutate: async ({ refundId }) => {
      await qc.cancelQueries({ queryKey: [...REFUND_REQUESTS_KEY, vendorId] });
      const snapshot = qc.getQueryData([...REFUND_REQUESTS_KEY, vendorId]);

      qc.setQueryData(
        [...REFUND_REQUESTS_KEY, vendorId],
        (old: any[]) => old?.filter((r) => r.id !== refundId) ?? [],
      );
      console.log(snapshot);
      return { snapshot };
    },

    onError: (error, _vars, ctx) => {
      if (ctx?.snapshot !== undefined) {
        qc.setQueryData([...REFUND_REQUESTS_KEY, vendorId], ctx.snapshot);
      }
      toast.danger(error.message);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: [...REFUND_REQUESTS_KEY, vendorId] });
      qc.invalidateQueries({
        queryKey: orderKeys.byVendor(vendorId ?? "no-vendor"),
      });
    },
    onSuccess: () => {
      toast.success("Refund request rejected.");
    },
  });
}
