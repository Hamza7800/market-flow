"use client";

import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useVendorPublic } from "@/hooks/use-public";
import { ArrowLeft, Clock, Mail, RotateCcw, Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";

const VendorDetails = ({ vendorId }: { vendorId: string }) => {
  const {
    data: vendor,
    isPending,
    isError,
    error,
    refetch,
  } = useVendorPublic(vendorId);
  const router = useRouter();

  if (isPending) {
    return <LoadingState />;
  }

  if (isError) {
    <ErrorState
      title={"No Products"}
      message={error.message}
      onRetry={refetch}
      homeHref={"/"}
    />;
  }

  if (!vendor) {
    return (
      <EmptyState
        icon={Store}
        title="Vendor not found"
        action={{
          label: "Back to vendors",
          onClick: () => router.push("/vendors"),
        }}
      />
    );
  }

  return (
    <section className="pb-16">
      {/* BANNER AREA */}
      <div className="relative h-48 w-full overflow-hidden rounded-2xl border bg-white md:h-64 lg:h-80">
        {vendor.bannerUrl ? (
          <Image
            src={vendor.bannerUrl}
            alt={`${vendor.storeName} banner`}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            {/* Abstract pattern or placeholder */}
            <Store size={80} className="text-accent" />
          </div>
        )}

        {/* BACK BUTTON (Floating over banner) */}
        <div className="absolute top-6 left-1/2 container -translate-x-1/2 px-4">
          <Link
            href="/vendors"
            className="text-foreground hover:bg-background inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-xs font-medium backdrop-blur-md transition-all"
          >
            <ArrowLeft size={14} /> Back to Vendors
          </Link>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="container mx-auto px-4">
        <div className="relative flex flex-col items-start gap-6 md:flex-row">
          {/* OVERLAPPING LOGO */}
          <div className="border-background relative -mt-12 h-32 w-32 shrink-0 overflow-hidden rounded-2xl border-2 bg-white shadow-lg md:-mt-16 md:h-40 md:w-40">
            {vendor.logoUrl ? (
              <Image
                src={vendor.logoUrl}
                alt={vendor.storeName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="text-accent flex h-full w-full items-center justify-center bg-white">
                <Store size={48} />
              </div>
            )}
          </div>

          {/* VENDOR INFO */}
          <div className="mt-4 flex-1 md:mt-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h1 className="text-foreground text-3xl font-bold tracking-tight md:text-4xl">
                  {vendor.storeName}
                </h1>

                {/* META INFO (Product count, etc) */}
                {/* <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-4 text-sm">
                  {vendor.contactEmail && (
                    <span className="flex items-center gap-1.5">
                      <Mail size={16} />
                      {vendor.contactEmail}
                    </span>
                  )}
                </div> */}
              </div>
            </div>

            <p className="text-muted-foreground mt-3 max-w-3xl text-base leading-relaxed">
              {vendor.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VendorDetails;
