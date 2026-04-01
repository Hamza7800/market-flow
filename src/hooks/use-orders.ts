import {
  getOrderDetails,
  getUserOrderDetails,
  getUserOrders,
  getVendorOrders,
  updateOrderItemStatus,
} from "@/actions/orders";
import { orderKeys } from "@/lib/cache-keys";
import type { OrderStatus } from "@/lib/nuqs/nuqs";
import { authClient } from "@/server/better-auth/client";
import type { UpdateOrderItemStatusInput } from "@/zod-schema/order-item-schema";
import { toast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export const useUserOrders = () => {
  const { data } = authClient.useSession();
  const userId = data?.user.id;

  return useQuery({
    queryKey: orderKeys.byUser(userId ?? "no-user"),
    queryFn: async () => {
      const result = await getUserOrders();
      if (!result.success) {
        throw new Error(result.message);
      }
      return result.data;
    },
    enabled: !!userId,
  });
};

export const useUserOrdersDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();

  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: async () => {
      const result = await getUserOrderDetails(orderId);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result.data;
    },
    enabled: !!orderId,
  });
};

export const useVendorOrders = (
  vendorId: string,
  status: OrderStatus,
  page: number,
) => {
  return useQuery({
    queryKey: orderKeys.vendorList(vendorId, status, page),
    queryFn: async () => {
      const result = await getVendorOrders(status, page);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
  });
};

export const useOrderItemDetails = (orderItemId: string) => {
  return useQuery({
    queryKey: ["order-item-details", orderItemId],
    queryFn: async () => {
      const result = await getOrderDetails(orderItemId);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result.data;
    },
  });
};

export const useUpdateOrderItemStatus = (
  vendorId: string,
  orderId: string,
  page: number,
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderItemId,
      input,
    }: {
      orderItemId: string;
      input: UpdateOrderItemStatusInput;
    }) => {
      const result = await updateOrderItemStatus(orderItemId, input);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result.data;
    },
    onMutate: async ({ input, orderItemId }) => {
      const key = ["order-item-details", orderItemId];
      await qc.cancelQueries({ queryKey: key });
      const snapshot = qc.getQueryData(key);

      qc.setQueryData(key, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          status: input.status,
          ...(input.status === "shipped" && {
            trackingNumber: input.trackingNumber,
            trackingUrl: input.trackingUrl ?? null,
            shippedAt: new Date().toISOString(),
          }),
          ...(input.status === "delivered" && {
            deliveredAt: new Date().toISOString(),
          }),
        };
      });
      return { snapshot };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.snapshot !== undefined) {
        qc.setQueryData(orderKeys.detail(orderId), ctx.snapshot);
      }
      toast.danger(err.message);
    },
    onSettled: (data) => {
      qc.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
      qc.invalidateQueries({ queryKey: orderKeys.byVendor(vendorId) });
      qc.invalidateQueries({
        queryKey: orderKeys.vendorList(vendorId, data!.oldStatus, page),
      });
    },
  });
};
