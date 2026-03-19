"use client";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useVendor } from "@/hooks/use-vedor";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, type ReactNode } from "react";

const VendorDashboardGuard = ({
  children,
  vendorId,
}: {
  vendorId: string;
  children: ReactNode;
}) => {
  const router = useRouter();
  const {
    loading,
    isVendor,
    refresh,
    isPending,
    isSuspended,
    isActive,
    profile,
  } = useVendor();

  useEffect(() => {
    if (isActive && vendorId && profile?.id && vendorId !== profile.id) {
      router.replace(`/vendor/${profile.id}/dashboard`);
    }
  }, [isActive, vendorId, profile?.id, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingState />
      </div>
    );
  }

  if (!isVendor) {
    return (
      <ErrorState
        title={"Not A Vendor"}
        message={"You are not a vendor"}
        onRetry={refresh}
        homeHref={"/"}
      />
    );
  }

  if (isPending) {
    return (
      <ErrorState
        title={"Pending Application"}
        message={"Your application is pending"}
        onRetry={refresh}
        homeHref={"/"}
      />
    );
  }

  if (isSuspended) {
    return (
      <ErrorState
        title={"Account Suspending"}
        message={"Your account is suspended"}
        onRetry={refresh}
        homeHref={"/"}
      />
    );
  }

  if (isActive && vendorId !== profile?.id) {
    return null;
  }

  return <>{children}</>;
};

export default VendorDashboardGuard;
