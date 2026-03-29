"use client";

import { useStripeConnect } from "@/hooks/use-stripe-connect";
import {
  Card,
  CardHeader,
  CardFooter,
  Button,
  Chip,
  Skeleton,
  Separator,
  CardContent,
  Spinner,
} from "@heroui/react";

import {
  CheckCircle,
  AlertCircle,
  Link2,
  RefreshCw,
  XCircle,
} from "lucide-react";

const StripeConnect = () => {
  const stripe = useStripeConnect();

  const isConnected = stripe.state === "connected";
  const isPending = stripe.state === "pending";
  const isError = stripe.state === "error";

  // 👉 fake fallback (replace with real timestamp from backend later)
  const lastSynced = new Date();

  return (
    <div className="mx-auto w-full p-6">
      <Card className="border">
        {/* HEADER */}
        <CardHeader className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* STRIPE LOGO */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
              <img
                src="https://stripe.com/img/v3/home/twitter.png"
                alt="Stripe"
                className="h-5"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold">Stripe Payments</h2>
              <p className="text-default-500 text-sm">
                Accept payments securely via Stripe
              </p>
            </div>
          </div>

          {/* STATUS */}
          {isConnected ? (
            <Chip color="success" variant="secondary">
              Connected
            </Chip>
          ) : isPending ? (
            <Chip color="warning" variant="secondary">
              Pending
            </Chip>
          ) : isError ? (
            <Chip color="danger" variant="secondary">
              Error
            </Chip>
          ) : (
            <Chip variant="soft">Not Connected</Chip>
          )}
        </CardHeader>

        <Separator />

        {/* BODY */}
        <CardContent className="flex flex-col gap-4">
          {/* LOADING SKELETON */}
          {stripe.isLoading && (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-1/3 rounded-lg" />
              <Skeleton className="h-3 w-2/3 rounded-lg" />
              <Skeleton className="h-3 w-1/2 rounded-lg" />
            </div>
          )}

          {/* ERROR STATE */}
          {isError && !stripe.isLoading && (
            <div className="bg-danger/10 flex items-start gap-3 rounded-xl p-4">
              <XCircle className="text-danger mt-1" />
              <div>
                <p className="text-sm font-medium">Something went wrong</p>
                <p className="text-default-500 text-xs">
                  We couldn’t connect your Stripe account. Please try again.
                </p>
              </div>
            </div>
          )}

          {/* CONNECTED */}
          {isConnected && !stripe.isLoading && (
            <div className="bg-success/10 flex items-start gap-3 rounded-xl p-4">
              <CheckCircle className="text-success mt-1" />
              <div>
                <p className="text-sm font-medium">
                  Your Stripe account is fully connected
                </p>
                <p className="text-default-500 text-xs">
                  You can now accept payments and receive payouts.
                </p>
              </div>
            </div>
          )}

          {/* PENDING */}
          {isPending && !stripe.isLoading && (
            <div className="bg-warning/10 flex items-start gap-3 rounded-xl p-4">
              <AlertCircle className="text-warning mt-1" />
              <div>
                <p className="text-sm font-medium">
                  Complete your Stripe onboarding
                </p>
                <p className="text-default-500 text-xs">
                  Finish setup to start receiving payments.
                </p>
              </div>
            </div>
          )}

          {/* NOT CONNECTED */}
          {!isConnected && !isPending && !isError && !stripe.isLoading && (
            <div className="bg-default-100 flex items-start gap-3 rounded-xl p-4">
              <Link2 className="text-default-500 mt-1" />
              <div>
                <p className="text-sm font-medium">
                  Connect your Stripe account
                </p>
                <p className="text-default-500 text-xs">
                  Securely connect Stripe to start accepting payments.
                </p>
              </div>
            </div>
          )}

          {/* LAST SYNC */}
          {!stripe.isLoading && (
            <div className="text-default-400 flex items-center justify-between text-xs">
              <span>Last synced: {new Date(lastSynced).toLocaleString()}</span>

              <Button
                size="sm"
                isPending={stripe.isLoading}
                onClick={() => stripe.sync?.()}
              >
                {({ isPending }) => (
                  <>
                    {isPending ? (
                      <Spinner color="current" size="sm" />
                    ) : (
                      "Refresh"
                    )}
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>

        <Separator />

        {/* ACTIONS */}
        <CardFooter className="flex justify-end gap-2">
          {isError && (
            <Button
              onClick={() => stripe.connect()}
              // isLoading={stripe.isLoading}
              isPending={stripe.isLoading}
            >
              {({ isPending }) => (
                <>
                  {isPending ? <Spinner color="current" size="sm" /> : "Retry"}
                </>
              )}
            </Button>
          )}

          {!isConnected && !isError && (
            <>
              {isPending && (
                <Button
                  onClick={() => stripe.resume()}
                  isDisabled={stripe.isLoading}
                  isPending={stripe.isLoading}
                >
                  {({ isPending }) => (
                    <>
                      {isPending ? (
                        <Spinner color="current" size="sm" />
                      ) : (
                        "Resume Setup"
                      )}
                    </>
                  )}
                </Button>
              )}

              <Button
                onClick={() => stripe.connect()}
                // isLoading={stripe.isLoading}
                isPending={stripe.isLoading}
              >
                {({ isPending }) => (
                  <>
                    {isPending ? (
                      <>
                        <Spinner color="current" size="sm" />
                        Continue
                      </>
                    ) : (
                      "Connect Stripe"
                    )}
                  </>
                )}
              </Button>
            </>
          )}

          {isConnected && <Button isDisabled>Connected</Button>}
        </CardFooter>
      </Card>
    </div>
  );
};

export default StripeConnect;
