import {
  getUserOrderDetails,
  getUserOrders,
  getVendorOrders,
} from "@/actions/orders";
import { orderKeys } from "@/lib/cache-keys";
import type { OrderStatus } from "@/lib/nuqs";
import { authClient } from "@/server/better-auth/client";
import { useQuery } from "@tanstack/react-query";
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
