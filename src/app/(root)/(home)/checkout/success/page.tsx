import { LoadingState } from "@/components/loading-state";
import { Suspense } from "react";
import CheckoutSuccess from "@/app/(root)/(home)/checkout/_components/checkout-success";

const CheckoutSuccessPage = () => {
  return (
    <Suspense fallback={<LoadingState />}>
      <CheckoutSuccess />
    </Suspense>
  );
};

export default CheckoutSuccessPage;
