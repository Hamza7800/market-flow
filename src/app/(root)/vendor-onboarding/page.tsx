import { isVendor } from "@/actions/vendor";
import { LoadingState } from "@/components/loading-state";
import MaxWidthContainer from "@/components/max-w-container";
import VendorForm from "@/components/vendor-form";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const Content = async () => {
  const { success, data } = await isVendor();
  if (success && data?.id) {
    redirect(`/vendor/${data.id}/dashboard`);
  }
  return (
    <MaxWidthContainer className="max-w-xl py-10">
      <VendorForm />
    </MaxWidthContainer>
  );
};

const VendorOnboarding = () => {
  return (
    <Suspense
      fallback={
        <div className="h-dvh">
          <LoadingState />
        </div>
      }
    >
      <Content />
    </Suspense>
  );
};

export default VendorOnboarding;
