import { create } from "zustand";
import { devtools } from "zustand/middleware";

type CartUIState = {
  isOpen: boolean;
  removingIds: Set<string>;
  updatingIds: Set<string>;
};

type CartUIActions = {
  openCart: () => void;
  closeCart: () => void;
  setIsOpen: (open: boolean) => void;
  markRemoving: (id: string) => void;
  unmarkRemoving: (id: string) => void;
  markUpdating: (id: string) => void;
  unmarkUpdating: (id: string) => void;
};

type CartStore = CartUIState & CartUIActions;

export const useCartStore = create<CartStore>()(
  devtools(
    (set) => ({
      isOpen: false,
      removingIds: new Set(),
      updatingIds: new Set(),

      openCart: () => set({ isOpen: true }, false, "openCart"),
      closeCart: () => set({ isOpen: false }, false, "closeCart"),
      setIsOpen: (open) => set({ isOpen: open }, false, "setIsOpen"),

      markRemoving: (id) =>
        set(
          (s) => ({ removingIds: new Set([...s.removingIds, id]) }),
          false,
          "markRemoving",
        ),
      unmarkRemoving: (id) =>
        set(
          (s) => {
            const next = new Set(s.removingIds);
            next.delete(id);
            return { removingIds: next };
          },
          false,
          "unmarkRemoving",
        ),
      markUpdating: (id) =>
        set(
          (s) => ({ updatingIds: new Set([...s.updatingIds, id]) }),
          false,
          "markUpdating",
        ),
      unmarkUpdating: (id) =>
        set(
          (s) => {
            const next = new Set(s.updatingIds);
            next.delete(id);
            return { updatingIds: next };
          },
          false,
          "unmarkUpdating",
        ),
    }),
    { name: "cart-ui-store" },
  ),
);

export const selectIsRemoving = (id: string) => (s: CartStore) =>
  s.removingIds.has(id);
export const selectIsUpdating = (id: string) => (s: CartStore) =>
  s.updatingIds.has(id);
