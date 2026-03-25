import {
  addToCart,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "@/actions/cart";
import { cartKeys } from "@/lib/cache-keys";
import type { Cart, CartItem } from "@/lib/types";
import { authClient } from "@/server/better-auth/client";
import type {
  AddToCartInput,
  UpdateCartItemInput,
} from "@/zod-schema/cart-schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function getItemPrice(item: CartItem): number {
  if (item.variant?.price) return Number(item.variant.price);
  return Number(item.priceAtAdd);
}

export function getItemTotal(item: CartItem): number {
  return getItemPrice(item) * item.quantity;
}

export function getCartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + getItemTotal(item), 0);
}

export function getCartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export const useCart = () => {
  const { data } = authClient.useSession();
  const userId = data?.user.id;

  return useQuery({
    queryKey: cartKeys.byUser(userId ?? "guest"),
    queryFn: async () => {
      const result = await getCart();
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!userId,
  });
};

export const useAddToCart = () => {
  const qc = useQueryClient();
  const { data } = authClient.useSession();
  const userId = data?.user.id;
  const cartKey = cartKeys.byUser(userId ?? "guest");

  return useMutation({
    mutationFn: async (input: AddToCartInput) => {
      const result = await addToCart(input);
      // console.log(result);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },

    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: cartKey });
      const snapshot = qc.getQueryData<Cart | null>(cartKey);

      qc.setQueryData<Cart | null>(cartKey, (old) => {
        if (!old) return old;

        const existingIndex = old.items.findIndex(
          (i) =>
            i.id === input.productId &&
            i.variantId === (input.variantId ?? null),
        );

        if (existingIndex !== -1) {
          const updated = [...old.items];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex]!.quantity + (input.quantity ?? 1),
          } as CartItem;

          return {
            ...old,
            items: updated,
          };
        }

        const optimisticItem: CartItem = {
          id: `optimistic-${Date.now()}`,
          cartId: old.id,
          productId: input.productId,
          variantId: input.variantId ?? null,
          quantity: input.quantity ?? 1,
          priceAtAdd: "0",
          product: {
            id: input.productId,
            name: "...",
            slug: "",
            basePrice: "0",
            hasVariants: false,
            stock: 99,
            images: [],
          },
          variant: null,
          createdAt: new Date(),
          updatedAt: null,
        };
        return { ...old, items: [...old.items, optimisticItem] };
      });

      return { snapshot };
    },
    onError: (_err, _input, ctx) => {
      console.error(_err);
      if (ctx?.snapshot !== undefined) {
        qc.setQueryData(cartKey, ctx.snapshot);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: cartKey });
    },
  });
};

export const useUpdateCartItems = () => {
  const qc = useQueryClient();
  const { data } = authClient.useSession();
  const userId = data?.user.id;
  const cartKey = cartKeys.byUser(userId ?? "guest");

  return useMutation({
    mutationFn: async (input: UpdateCartItemInput) => {
      const result = await updateCartItem(input);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    onMutate: async ({ cartItemId, quantity }) => {
      await qc.cancelQueries({ queryKey: cartKey });
      const snapshot = qc.getQueryData<Cart | null>(cartKey);

      qc.setQueryData<Cart | null>(cartKey, (old) => {
        if (!old) return old;

        if (quantity === 0) {
          return {
            ...old,
            items: old.items.filter((i) => i.id !== cartItemId),
          };
        }

        return {
          ...old,
          items: old.items.map((item) =>
            item.id === cartItemId ? { ...item, quantity } : item,
          ),
        };
      });

      return { snapshot };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.snapshot !== undefined) {
        qc.setQueryData(cartKey, ctx.snapshot);
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: cartKey });
    },
  });
};

export function useRemoveCartItem() {
  const { data } = authClient.useSession();
  const userId = data?.user.id;
  const qc = useQueryClient();
  const cartKey = cartKeys.byUser(userId ?? "guest");

  return useMutation({
    mutationFn: async (cartItemId: string) => {
      const result = await removeCartItem(cartItemId);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },

    onMutate: async (cartItemId) => {
      await qc.cancelQueries({ queryKey: cartKey });
      const snapshot = qc.getQueryData<Cart | null>(cartKey);

      qc.setQueryData<Cart | null>(cartKey, (old) => {
        if (!old) return old;
        return { ...old, items: old.items.filter((i) => i.id !== cartItemId) };
      });

      return { snapshot };
    },

    onError: (_err, _input, ctx) => {
      if (ctx?.snapshot !== undefined) {
        qc.setQueryData(cartKey, ctx.snapshot);
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: cartKey });
    },
  });
}

export function useClearCart() {
  const qc = useQueryClient();
  const { data } = authClient.useSession();
  const userId = data?.user.id;
  const cartKey = cartKeys.byUser(userId ?? "guest");

  return useMutation({
    mutationFn: async () => {
      const result = await clearCart();
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },

    onMutate: async () => {
      await qc.cancelQueries({ queryKey: cartKey });
      const snapshot = qc.getQueryData<Cart | null>(cartKey);
      qc.setQueryData<Cart | null>(cartKey, (old) =>
        old ? { ...old, items: [] } : old,
      );
      // qc.setQueryData<Cart | null>(cartKey, null);
      return { snapshot };
    },

    onError: (_err, _input, ctx) => {
      if (ctx?.snapshot !== undefined) {
        qc.setQueryData(cartKey, ctx.snapshot);
      }
    },

    onSettled: () => {
      qc.setQueryData<Cart | null>(cartKey, null);
      qc.invalidateQueries({ queryKey: cartKey });
    },
  });
}
