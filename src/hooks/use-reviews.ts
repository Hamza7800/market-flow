import {
  createReview,
  deleteReview,
  getProductReviews,
  getUserReviewForOrderItem,
  updateReview,
} from "@/actions/reviews";
import { orderKeys, productKeys, reviewKeys } from "@/lib/cache-keys";
import { authClient } from "@/server/better-auth/client";
import type { ReviewSchema } from "@/zod-schema/review-schema";
import { toast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: reviewKeys.byProduct(productId),
    queryFn: async () => {
      const r = await getProductReviews(productId);
      if (!r.success) throw new Error(r.message);
      return r.data;
    },
  });
}

export function useUserReviewForOrderItem(orderItemId: string) {
  const { data } = authClient.useSession();
  const userId = data?.user.id;

  return useQuery({
    queryKey: [...reviewKeys.byUser(userId ?? ""), "item", orderItemId],
    queryFn: async () => {
      const r = await getUserReviewForOrderItem(orderItemId);
      if (!r.success) throw new Error(r.message);
      return r.data;
    },
    // enabled: !!userId && !!orderItemId,
  });
}

export function useCreateReview(productId: string, orderId: string) {
  const qc = useQueryClient();
  const { data } = authClient.useSession();
  const userId = data?.user.id;

  return useMutation({
    mutationFn: async ({
      orderItemId,
      values,
    }: {
      orderItemId: string;
      values: ReviewSchema;
    }) => {
      const r = await createReview(orderItemId, values);
      if (!r.success) throw new Error(r.message);
      return r;
    },

    onSuccess: (result, { orderItemId }) => {
      // Update the review list for this product optimistically
      qc.invalidateQueries({ queryKey: reviewKeys.byProduct(productId) });
      qc.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
      qc.refetchQueries({
        queryKey: [...reviewKeys.byUser(userId ?? ""), "item", orderItemId],
      });
      qc.invalidateQueries({ queryKey: productKeys.all() });
    },
    onError: (err) => {
      toast.danger(err.message);
    },
  });
}

export function useUpdateReview(productId: string, orderItemId: string) {
  const qc = useQueryClient();
  const { data } = authClient.useSession();
  const userId = data?.user.id;

  return useMutation({
    mutationFn: async ({
      reviewId,
      values,
    }: {
      reviewId: string;
      values: ReviewSchema;
    }) => {
      const r = await updateReview(reviewId, values);
      if (!r.success) {
        throw new Error(r.message);
      }
      return r;
    },

    onMutate: async ({ reviewId, values }) => {
      await qc.cancelQueries({ queryKey: reviewKeys.byProduct(productId) });
      const snapshot = qc.getQueryData(reviewKeys.byProduct(productId));

      qc.setQueryData(
        reviewKeys.byProduct(productId),
        (old: any[]) =>
          old?.map((r) =>
            r.id === reviewId
              ? { ...r, ...values, updatedAt: new Date().toISOString() }
              : r,
          ) ?? [],
      );

      return { snapshot };
    },

    onError: (err, _vars, ctx) => {
      if (ctx?.snapshot !== undefined) {
        qc.setQueryData(reviewKeys.byProduct(productId), ctx.snapshot);
      }
      toast.danger(err.message);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: reviewKeys.byProduct(productId) });
      // qc.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
      qc.setQueryData(
        [...reviewKeys.byUser(userId ?? ""), "item", orderItemId],
        null,
      );
      qc.invalidateQueries({
        queryKey: [...reviewKeys.byUser(userId ?? ""), "item", orderItemId],
      });
      qc.invalidateQueries({ queryKey: productKeys.all() });
    },
    onSuccess: (data) => {
      toast.success(data.message);
    },
  });
}

// export function useDeleteReview(productId: string, orderItemId: string) {
//   const qc = useQueryClient();
//   const { data } = authClient.useSession();
//   const userId = data?.user.id;

//   return useMutation({
//     mutationFn: async (reviewId: string) => {
//       const r = await deleteReview(reviewId);
//       if (!r.success) {
//         throw new Error(r.message);
//       }
//       return r;
//     },

//     onMutate: async (reviewId) => {
//       await qc.cancelQueries({ queryKey: reviewKeys.byProduct(productId) });
//       const snapshot = qc.getQueryData(reviewKeys.byProduct(productId));

//       qc.setQueryData(
//         reviewKeys.byProduct(productId),
//         (old: any[]) => old?.filter((r) => r.id !== reviewId) ?? [],
//       );

//       return { snapshot };
//     },

//     onError: (err, _vars, ctx) => {
//       if (ctx?.snapshot !== undefined) {
//         qc.setQueryData(reviewKeys.byProduct(productId), ctx.snapshot);
//       }
//       toast.danger(err.message);
//     },

//     onSettled: () => {
//       qc.invalidateQueries({ queryKey: reviewKeys.byProduct(productId) });
//       // qc.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
//       qc.refetchQueries({
//         queryKey: [...reviewKeys.byUser(userId ?? ""), "item", orderItemId],
//       });
//       qc.invalidateQueries({ queryKey: productKeys.all() });
//     },
//     onSuccess: (data) => {
//       toast.success(data.message);
//     },
//   });
// }
export function useDeleteReview(productId: string, orderItemId: string) {
  const qc = useQueryClient();
  const { data } = authClient.useSession();
  const userId = data?.user.id;
  const userItemKey = [...reviewKeys.byUser(userId ?? ""), "item", orderItemId];

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const r = await deleteReview(reviewId);
      if (!r.success) throw new Error(r.message);
      return r;
    },

    onMutate: async (reviewId) => {
      // 1. Cancel outgoing refetches
      await qc.cancelQueries({ queryKey: reviewKeys.byProduct(productId) });
      await qc.cancelQueries({ queryKey: userItemKey });

      // 2. Snapshot current data
      const productListSnapshot = qc.getQueryData(
        reviewKeys.byProduct(productId),
      );
      const itemReviewSnapshot = qc.getQueryData(userItemKey);

      // 3. Optimistically update Product List
      qc.setQueryData(
        reviewKeys.byProduct(productId),
        (old: any[]) => old?.filter((r) => r.id !== reviewId) ?? [],
      );

      // 4. Optimistically CLEAR the User Item Review
      // This is what prevents the deleted review from "sticking" in the UI
      qc.setQueryData(userItemKey, null);

      return { productListSnapshot, itemReviewSnapshot };
    },

    onError: (err, _vars, ctx) => {
      // Rollback both caches on error
      if (ctx?.productListSnapshot !== undefined) {
        qc.setQueryData(
          reviewKeys.byProduct(productId),
          ctx.productListSnapshot,
        );
      }
      if (ctx?.itemReviewSnapshot !== undefined) {
        qc.setQueryData(userItemKey, ctx.itemReviewSnapshot);
      }
      toast.danger(err.message);
    },

    onSettled: () => {
      // Invalidate to sync with server truth
      qc.invalidateQueries({ queryKey: reviewKeys.byProduct(productId) });
      qc.invalidateQueries({ queryKey: userItemKey });
      qc.invalidateQueries({ queryKey: productKeys.all() });
    },

    onSuccess: (data) => {
      toast.success(data.message);
    },
  });
}
