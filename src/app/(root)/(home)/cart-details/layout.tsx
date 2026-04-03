import MaxWidthContainer from "@/components/max-w-container";
import type { ReactNode } from "react";

const CartDetailsLayout = ({ children }: { children: ReactNode }) => {
  return <MaxWidthContainer>{children}</MaxWidthContainer>;
};

export default CartDetailsLayout;
