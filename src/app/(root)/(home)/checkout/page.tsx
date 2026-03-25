"use client";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { env } from "@/env";
import CheckoutForm from "./_components/checkout-form";
import MaxWidthContainer from "@/components/max-w-container";

const stripePromise = loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function CheckoutPage() {
  return (
    <MaxWidthContainer>
      <Elements
        stripe={stripePromise}
        options={{
          mode: "payment",
          currency: "usd",
          // Amount is a placeholder — the real amount comes from createPaymentIntent
          // Elements needs an amount to initialise the PaymentElement UI
          amount: 100,
          appearance: {
            theme: "stripe",
            variables: {
              colorPrimary: "#006FEE",
              borderRadius: "12px",
              fontFamily: "inherit",
            },
          },
        }}
      >
        <CheckoutForm />
      </Elements>
    </MaxWidthContainer>
  );
}
