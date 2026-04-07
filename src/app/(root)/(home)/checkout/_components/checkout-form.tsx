import {
  Alert,
  Button,
  Checkbox,
  Chip,
  FieldError,
  Input,
  Label,
  Select,
  ListBox,
  Separator,
  Skeleton,
  TextField,
  Card,
  Form,
} from "@heroui/react";
import { PaymentElement } from "@stripe/react-stripe-js";
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  Box,
  LockIcon,
  PackageIcon,
  ShoppingBagIcon,
  TagIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Controller } from "react-hook-form";
import {
  useCheckout,
  useCheckoutSummary,
  useValidateDiscount,
} from "@/hooks/use-checkout";
import { COUNTRIES } from "@/zod-schema/checkout-schema";
import { EmptyState } from "@/components/empty-state";
import { useRouter } from "nextjs-toploader/app";
import { usePathname } from "next/navigation";
import { authClient } from "@/server/better-auth/client";
import CheckoutSkeleton from "@/components/loading-skeletons/checkout-loading";

const CheckoutForm = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: userAuth, isPending: userPending } = authClient.useSession();
  const userId = userAuth?.user.id;

  const {
    form,
    onSubmit,
    step,
    setStep,
    serverError,
    setServerError,
    clientSecret,
    confirmPayment,
    orderTotals,
    isCreatingIntent,
    isProcessingPayment,
  } = useCheckout();

  const { data: summary, isLoading: summaryLoading } = useCheckoutSummary();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  const isPaymentStep = step === "payment" || step === "processing";

  if (!userPending && !userId) {
    return (
      <div className="h-dvh">
        <EmptyState
          icon={AlertCircleIcon}
          title="Login"
          className="h-full"
          description="Please login to continue"
          action={{
            label: "Sign In",
            onClick: () =>
              router.push(`/sign-in?${encodeURIComponent(pathname)}`),
          }}
        />
      </div>
    );
  }

  if (summaryLoading || userPending) {
    return <CheckoutSkeleton />;
  }

  if (!summaryLoading && !summary?.itemCount) {
    return (
      <div className="h-dvh">
        <EmptyState
          icon={Box}
          title="Empty Cart"
          className="h-full"
          description="Continue Shopping"
          action={{
            label: "Products",
            onClick: () => router.push(`/products`),
          }}
        />
      </div>
    );
  }

  return (
    <div className="pt-3 pb-20">
      <div className="mb-6">
        <Link
          href="/cart-details"
          className="text-accent mb-6 flex w-fit items-center gap-2 text-sm hover:underline"
        >
          <ArrowLeftIcon size={13} /> Back to cart
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {serverError && (
            <Alert status="danger">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Unable to Continue</Alert.Title>
                <Alert.Description>{serverError}</Alert.Description>
                <Button
                  onClick={() => setServerError(null)}
                  className="mt-2 sm:hidden"
                  size="sm"
                  variant="danger"
                >
                  Clear
                </Button>
              </Alert.Content>
              <Button
                className="hidden sm:block"
                size="sm"
                onClick={() => setServerError(null)}
                variant="danger"
              >
                Retry
              </Button>
            </Alert>
          )}

          {!isPaymentStep && (
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Card className="border p-4 shadow-none">
                <h2 className="flex items-center gap-2 text-base font-semibold">
                  <span className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                    1
                  </span>
                  Contact &amp; Shipping
                </h2>

                {/* Contact */}
                {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"> */}
                <Controller
                  control={control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      type="email"
                      isInvalid={fieldState.invalid}
                    >
                      <Label className="mb-1.5 block text-xs font-medium text-zinc-400">
                        Email
                      </Label>
                      <Input
                        className={"border-border border shadow-none"}
                        placeholder="john@example.com"
                      />
                      <FieldError className="mt-1 text-xs text-red-400">
                        {fieldState.error?.message}
                      </FieldError>
                    </TextField>
                  )}
                />

                {/* <TextField
                    isInvalid={!!errors.phone}
                    className="sm:col-span-2"
                  >
                    <Label>
                      Phone{" "}
                      <span className="text-default-400 text-xs">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      {...register("phone")}
                      type="tel"
                      className={"border-border border shadow-none"}
                      placeholder="+1 555 000 0000"
                    />
                    <FieldError>{errors.phone?.message}</FieldError>
                  </TextField> */}
                {/* </div> */}
                <Controller
                  control={control}
                  name="phone"
                  render={({ field, fieldState }) => (
                    <TextField {...field} isInvalid={fieldState.invalid}>
                      <Label className="mb-1.5 block text-xs font-medium text-zinc-400">
                        Phone (Optional)
                      </Label>
                      <Input className={"border-border border shadow-none"} />
                      <FieldError className="mt-1 text-xs text-red-400">
                        {fieldState.error?.message}
                      </FieldError>
                    </TextField>
                  )}
                />

                {/* <Separator /> */}

                {/* Address */}
                <Controller
                  control={control}
                  name="fullName"
                  render={({ field, fieldState }) => (
                    <TextField {...field} isInvalid={fieldState.invalid}>
                      <Label className="mb-1.5 block text-xs font-medium text-zinc-400">
                        Full Name
                      </Label>
                      <Input className={"border-border border shadow-none"} />
                      <FieldError className="mt-1 text-xs text-red-400">
                        {fieldState.error?.message}
                      </FieldError>
                    </TextField>
                  )}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* <TextField
                    isInvalid={!!errors.fullName}
                    isRequired
                    className="sm:col-span-2"
                  >
                    <Label>Full name</Label>
                    <Input
                      {...register("fullName")}
                      className={"border-border border shadow-none"}
                      placeholder="Jane Smith"
                    />
                    <FieldError>{errors.fullName?.message}</FieldError>
                  </TextField> */}
                  {/* 
                  <TextField
                    isInvalid={!!errors.line1}
                    isRequired
                    className="sm:col-span-2"
                  >
                    <Label>Address</Label>
                    <Input
                      {...register("line1")}
                      className={"border-border border shadow-none"}
                      placeholder="123 Main Street"
                    />
                    <FieldError>{errors.line1?.message}</FieldError>
                  </TextField> */}
                  <Controller
                    control={control}
                    name="line1"
                    render={({ field, fieldState }) => (
                      <TextField {...field} isInvalid={fieldState.invalid}>
                        <Label className="mb-1.5 block text-xs font-medium text-zinc-400">
                          Address
                        </Label>
                        <Input className={"border-border border shadow-none"} />
                        <FieldError className="mt-1 text-xs text-red-400">
                          {fieldState.error?.message}
                        </FieldError>
                      </TextField>
                    )}
                  />
                  <Controller
                    control={control}
                    name="line2"
                    render={({ field, fieldState }) => (
                      <TextField {...field} isInvalid={fieldState.invalid}>
                        <Label>
                          Apt, suite, etc.{" "}
                          <span className="text-default-400 text-xs">
                            (optional)
                          </span>
                        </Label>
                        <Input className={"border-border border shadow-none"} />
                        <FieldError className="mt-1 text-xs text-red-400">
                          {fieldState.error?.message}
                        </FieldError>
                      </TextField>
                    )}
                  />
                  {/* 
                  <TextField className="sm:col-span-2">
                    <Label>
                      Apt, suite, etc.{" "}
                      <span className="text-default-400 text-xs">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      {...register("line2")}
                      className={"border-border border shadow-none"}
                      placeholder="Apt 4B"
                    />
                  </TextField> */}
                  <Controller
                    control={control}
                    name="city"
                    render={({ field, fieldState }) => (
                      <TextField {...field} isInvalid={fieldState.invalid}>
                        <Label>City</Label>
                        <Input className={"border-border border shadow-none"} />
                        <FieldError className="mt-1 text-xs text-red-400">
                          {fieldState.error?.message}
                        </FieldError>
                      </TextField>
                    )}
                  />

                  {/* <TextField isInvalid={!!errors.city} isRequired>
                    <Label>City</Label>
                    <Input
                      {...register("city")}
                      className={"border-border border shadow-none"}
                      placeholder="Brooklyn"
                    />
                    <FieldError>{errors.city?.message}</FieldError>
                  </TextField> */}

                  {/* <TextField isInvalid={!!errors.state}>
                    <Label>State / Province</Label>
                    <Input
                      {...register("state")}
                      className={"border-border border shadow-none"}
                      placeholder="NY"
                    />
                    <FieldError>{errors.state?.message}</FieldError>
                  </TextField> */}

                  <Controller
                    control={control}
                    name="state"
                    render={({ field, fieldState }) => (
                      <TextField {...field} isInvalid={fieldState.invalid}>
                        <Label>State</Label>
                        <Input className={"border-border border shadow-none"} />
                        <FieldError className="mt-1 text-xs text-red-400">
                          {fieldState.error?.message}
                        </FieldError>
                      </TextField>
                    )}
                  />
                  {/* <TextField isInvalid={!!errors.postalCode} isRequired>
                    <Label>Postal code</Label>
                    <Input
                      {...register("postalCode")}
                      className={"border-border border shadow-none"}
                      placeholder="10001"
                    />
                    <FieldError>{errors.postalCode?.message}</FieldError>
                  </TextField> */}
                  <Controller
                    control={control}
                    name="postalCode"
                    render={({ field, fieldState }) => (
                      <TextField {...field} isInvalid={fieldState.invalid}>
                        <Label>Postal Code</Label>
                        <Input className={"border-border border shadow-none"} />
                        <FieldError className="mt-1 text-xs text-red-400">
                          {fieldState.error?.message}
                        </FieldError>
                      </TextField>
                    )}
                  />

                  <Controller
                    control={control}
                    name="country"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onChange={(key) => field.onChange(String(key))}
                        isInvalid={!!errors.country}
                        isRequired
                      >
                        <Label>Country</Label>
                        <Select.Trigger
                          className={"border-border border shadow-none"}
                        >
                          <Select.Value />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox>
                            {COUNTRIES.map((c) => (
                              <ListBox.Item
                                key={c.code}
                                id={c.code}
                                textValue={c.name}
                              >
                                <Label>{c.name}</Label>
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                        <FieldError>{errors.country?.message}</FieldError>
                      </Select>
                    )}
                  />
                </div>

                {/* Save address */}
                {/* {userId && ( */}
                {/* <Controller
                  control={control}
                  name="saveAddress"
                  render={({ field }) => (
                    <Checkbox
                      isSelected={field.value}
                      onChange={field.onChange}
                    >
                      Save this address to my account
                    </Checkbox>
                  )}
                /> */}
                {/* )} */}
              </Card>

              {/* Discount code */}
              {/* <DiscountCodeInput
                subtotal={summary?.subtotal ?? 0}
                className="mt-4"
              /> */}
              <Card.Footer>
                <Button
                  type="submit"
                  size="lg"
                  // isLoading={isCreatingIntent}
                  className="mt-6 w-full font-semibold sm:w-fit"
                  // startContent={!isCreatingIntent && <LockIcon className="h-4 w-4" />}
                >
                  {isCreatingIntent
                    ? "Preparing payment..."
                    : "Continue to payment"}
                </Button>
              </Card.Footer>
            </Form>
          )}

          {/* ── Step 2: Payment ───────────────────────────────────────── */}
          {isPaymentStep && clientSecret && (
            <section className="border-divider space-y-5 rounded-2xl border bg-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-semibold">
                  <span className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                    2
                  </span>
                  Payment
                </h2>
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="text-primary text-xs hover:underline"
                >
                  ← Edit shipping
                </button>
              </div>

              {/* Stripe PaymentElement */}
              <PaymentElement
                options={{
                  layout: "tabs",
                  fields: { billingDetails: { email: "never" } },
                }}
              />

              <Button
                // color="primary"
                size="lg"
                fullWidth
                // isLoading={isProcessingPayment}
                onPress={confirmPayment}
                className="font-semibold"
                // startContent={!isProcessingPayment && <LockIcon className="h-4 w-4" />}
              >
                {isProcessingPayment
                  ? "Processing..."
                  : `Pay $${(orderTotals?.total ?? 0).toFixed(2)}`}
              </Button>

              <p className="text-default-400 flex items-center justify-center gap-1.5 text-center text-xs">
                <LockIcon className="h-3 w-3" />
                Secured by Stripe. We never store your card details.
              </p>
            </section>
          )}
        </div>

        {/* ── Right — Order Summary ─────────────────────────────────── */}
        <aside className="space-y-4">
          <Card className="border">
            <Card.Header>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <ShoppingBagIcon className="h-4 w-4" />
                Order summary
                {summary && (
                  <Chip
                    size="sm"
                    // variant="flat"
                    className="ml-auto h-5 text-xs"
                  >
                    {summary.itemCount} item{summary.itemCount !== 1 ? "s" : ""}
                  </Chip>
                )}
              </h3>
            </Card.Header>

            {summaryLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-14 w-14 rounded-xl" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-3/4 rounded" />
                      <Skeleton className="h-3 w-1/2 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {summary?.cart.items.map((item) => {
                  const price = item.variant?.price
                    ? Number(item.variant.price)
                    : Number(item.product.basePrice);
                  const image = item.product.images?.[0];

                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="bg-default-100 relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                        {image ? (
                          <Image
                            src={image.url}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <PackageIcon className="text-default-300 h-5 w-5" />
                          </div>
                        )}
                        {/* Quantity badge */}
                        <span className="bg-default-700 absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-xs font-medium">
                          {item.product.name}
                        </p>
                        {item.variant && (
                          <p className="text-default-400 text-[11px]">
                            {item.variant.name}
                          </p>
                        )}
                        <p className="mt-0.5 text-xs font-semibold">
                          ${(price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <Separator className="my-4" />

            {/* Totals */}
            <Card.Footer className="w-full flex-col items-start space-y-1.5 text-sm">
              <div className="flex w-full justify-between">
                <span className="text-default-500">Subtotal</span>
                <span>
                  {summaryLoading ? (
                    <Skeleton className="h-4 w-14 rounded" />
                  ) : (
                    `$${(summary?.subtotal ?? 0).toFixed(2)}`
                  )}
                </span>
              </div>

              {(orderTotals?.discountAmount ?? 0) > 0 && (
                <div className="text-success flex w-full justify-between">
                  <span className="flex items-center gap-1">
                    <TagIcon className="h-3 w-3" />
                    Discount
                  </span>
                  <span>−${orderTotals!.discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex w-full justify-between">
                <span className="text-default-500">Shipping</span>
                <span className="text-success">
                  {(orderTotals?.shippingAmount ?? 0) === 0
                    ? "Free"
                    : `$${orderTotals!.shippingAmount.toFixed(2)}`}
                </span>
              </div>

              <Separator className="my-2" />

              <div className="flex w-full items-center justify-between font-semibold">
                <span>Total</span>
                <span className="text-lg">
                  ${(orderTotals?.total ?? summary?.subtotal ?? 0).toFixed(2)}
                </span>
              </div>
            </Card.Footer>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default CheckoutForm;

function DiscountCodeInput({
  subtotal,
  className,
}: {
  subtotal: number;
  className?: string;
}) {
  const [code, setCode] = useState("");
  const { mutate, isPending, data } = useValidateDiscount();

  const applied = data?.success ? data.data : null;

  return (
    <div
      className={[
        "border-divider bg-content1 rounded-2xl border p-4",
        className,
      ].join(" ")}
    >
      <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
        <TagIcon className="h-3.5 w-3.5" />
        Discount code
      </p>

      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="SAVE20"
          className="flex-1 font-mono text-sm uppercase"
          // isDisabled={!!applied}
        />
        <Button
          // variant="flat"
          // color="primary"
          size="sm"
          // isLoading={isPending}
          isDisabled={!code || !!applied}
          onPress={() => mutate({ code, subtotal })}
        >
          Apply
        </Button>
      </div>

      {data && !data.success && (
        <p className="text-danger mt-1.5 text-xs">{data.message}</p>
      )}

      {applied && (
        <div className="text-success mt-2 flex items-center gap-1.5 text-xs">
          <TagIcon className="h-3 w-3" />
          {data?.message} · −${applied.discountAmount.toFixed(2)} off
        </div>
      )}
    </div>
  );
}
