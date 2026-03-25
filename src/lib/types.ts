type CartProduct = {
  id: string;
  name: string;
  slug: string;
  basePrice: string;
  hasVariants: boolean;
  stock: number;
  images: { url: string; altText: string | null }[];
};

type CartVariant = {
  id: string;
  name: string;
  price: string | null;
  stock: number;
  options: string;
};

export type CartItem = {
  id: string;
  cartId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  priceAtAdd: string;
  createdAt: Date;
  updatedAt: Date | null;
  product: CartProduct;
  variant: CartVariant | null;
};

export type Cart = {
  id: string;
  userId: string;
  discountCodeId: string | null;
  items: CartItem[];
  discountCode: {
    id: string;
    code: string;
    type: "percentage" | "fixed";
    value: string;
  } | null;
};
