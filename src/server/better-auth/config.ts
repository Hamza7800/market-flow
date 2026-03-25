import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "@/env";
import { db } from "@/server/db";
import { nextCookies } from "better-auth/next-js";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";
import {
  handleAccountDeauthorized,
  handleAccountUpdated,
  handlePaymentFailed,
  handlePaymentSucceeded,
} from "@/actions/stripe";

export const stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-02-25.clover",
});

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "pg" or "mysql"
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    stripe({
      stripeClient,
      stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
      createCustomerOnSignUp: true,
      onEvent: async (event) => {
        switch (event.type) {
          case "account.updated": {
            const account = event.data.object as Stripe.Account;
            await handleAccountUpdated(account);
            break;
          }
          case "account.application.deauthorized": {
            const deauth = event.data.object as { id: string };
            await handleAccountDeauthorized(deauth.id);
            break;
          }
          case "payment_intent.succeeded": {
            await handlePaymentSucceeded(
              event.data.object as Stripe.PaymentIntent,
            );
            break;
          }

          case "payment_intent.payment_failed": {
            await handlePaymentFailed(
              event.data.object as Stripe.PaymentIntent,
            );
            break;
          }

          default:
            break;
        }
      },
    }),
    nextCookies(), //ALWAYS LAST
  ],
});

export type Session = typeof auth.$Infer.Session;
