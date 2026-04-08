"use client";

import { LinkButton } from "@/components/link-button";
import { authClient } from "@/server/better-auth/client";
// import { Button, Chip } from "@heroui/react";
import {
  CheckCircleIcon,
  // PackageIcon,
  // ShoppingBagIcon
} from "lucide-react";
import { useSearchParams } from "next/navigation";

export const CheckoutSuccess = () => {
  const params = useSearchParams();
  const { data } = authClient.useSession();
  const orderId = params.get("orderId");
  const userId = data?.user.id;

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <div className="bg-success/10 mb-6 flex h-20 w-20 items-center justify-center rounded-full">
        <CheckCircleIcon className="text-success h-10 w-10" />
      </div>

      <h1 className="text-2xl font-semibold tracking-tight">
        Order confirmed!
      </h1>
      <p className="text-default-500 mt-2">
        Thank you for your purchase. You'll receive a confirmation email
        shortly.
      </p>

      {/* {orderId && (
        <Chip size="sm" className="mt-4 font-mono text-xs">
          Order #{orderId.slice(-8).toUpperCase()}
        </Chip>
      )} */}

      <div className="mt-8 flex w-full flex-col gap-3">
        {orderId && (
          <LinkButton fullWidth href={`/user/${userId}/orders/${orderId}`}>
            View order
          </LinkButton>
        )}
        <LinkButton fullWidth href="/">
          Continue shopping
        </LinkButton>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
