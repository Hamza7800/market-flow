import {
  createPaymentIntent,
  getCheckoutSummary,
  validateDiscountCode,
} from "@/actions/checkout";
import { cartKeys } from "@/lib/cache-keys";
import { authClient } from "@/server/better-auth/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "nextjs-toploader/app";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  checkoutDefaults,
  checkoutSchema,
  type CheckoutSchema,
} from "@/zod-schema/checkout-schema";

export function useCheckoutSummary() {
  const { data } = authClient.useSession();
  const userId = data?.user.id;

  return useQuery({
    queryKey: [...cartKeys.byUser(userId ?? "guest"), "checkout-summary"],
    queryFn: async () => {
      const result = await getCheckoutSummary();
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!userId,
  });
}

export function useValidateDiscount() {
  return useMutation({
    mutationFn: async ({
      code,
      subtotal,
    }: {
      code: string;
      subtotal: number;
    }) => {
      const result = await validateDiscountCode(code, subtotal);
      if (!result.success) throw new Error(result.message);
      return result;
    },
  });
}

type CheckoutStep = "form" | "payment" | "processing" | "success" | "error";

export const useCheckout = () => {
  const router = useRouter();
  const { data } = authClient.useSession();
  const stripeHook = useStripe();
  const elements = useElements();
  const qc = useQueryClient();

  const [step, setStep] = useState<CheckoutStep>("form");
  const [serverError, setServerError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderTotals, setOrderTotals] = useState<{
    total: number;
    subtotal: number;
    discountAmount: number;
    shippingAmount: number;
  } | null>(null);
  const userId = data?.user.id;

  const form = useForm<CheckoutSchema>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: checkoutDefaults,
    mode: "onChange",
  });

  const intentMutation = useMutation({
    mutationFn: async (values: CheckoutSchema) => {
      const result = await createPaymentIntent(values);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: (data) => {
      if (!data) {
        setServerError("Unable to create checkout");
        setStep("error");
        return;
      }
      setClientSecret(data.clientSecret);
      setOrderId(data?.orderId!);
      setOrderTotals({
        total: data.total,
        subtotal: data.subtotal,
        discountAmount: data.discountAmount,
        shippingAmount: data.shippingAmount,
      });
      setStep("payment");
    },
    onError: (error) => {
      setServerError(
        error instanceof Error ? error.message : "Something went wrong",
      );
      setStep("error");
    },
  });

  const confirmPayment = useCallback(async () => {
    if (!stripeHook || !elements || !clientSecret) return;

    setStep("processing");
    setServerError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setServerError(submitError.message ?? "Invalid payment details");
      setStep("payment");
      return;
    }

    const { error } = await stripeHook.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        payment_method_data: {
          billing_details: {
            email: data?.user.email,
          },
        },
        return_url: `${window.location.origin}/checkout/success${orderId ? `?orderId=${orderId}` : ""}`,
      },
      redirect: "if_required",
    });

    if (error) {
      setServerError(
        error.type === "card_error" || error.type === "validation_error"
          ? (error.message ?? "Payment failed")
          : "Payment failed. Please try again.",
      );
      setStep("payment");
      return;
    }

    if (userId) {
      qc.setQueryData(cartKeys.byUser(userId), null);
    }

    setStep("success");
    router.replace(`/checkout/success${orderId ? `?orderId=${orderId}` : ""}`);
  }, [stripeHook, elements, clientSecret, orderId, userId]);

  const onSubmit = async (values: CheckoutSchema) => {
    setServerError(null);
    await intentMutation.mutateAsync(values);
  };

  return {
    form,
    onSubmit,
    step,
    setStep,
    serverError,
    setServerError,

    clientSecret,
    confirmPayment,

    orderTotals,
    orderId,

    isCreatingIntent: intentMutation.isPending,
    isProcessingPayment: step === "processing",
    isLoading: intentMutation.isPending || step === "processing",
  };
};
