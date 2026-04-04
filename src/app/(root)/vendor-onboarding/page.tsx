import { isVendor } from "@/actions/vendor";
import { LoadingState } from "@/components/loading-state";
import MaxWidthContainer from "@/components/max-w-container";
import VendorForm from "@/components/vendor-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const Content = async () => {
  const { success, data } = await isVendor();
  if (success && data?.id) {
    redirect(`/vendor/${data.id}/dashboard`);
  }
  return (
    <MaxWidthContainer className="">
      <div className=" ">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
          <Link
            href="/"
            className="text-accent hover:text-accent/80 mb-4 inline-flex cursor-pointer items-center gap-2 font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <h1 className="text-foreground mb-2 text-4xl font-bold">
            Become a Vendor
          </h1>
          <p className="text-muted-foreground text-lg">
            Join our marketplace and start selling your products to thousands of
            customers
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-xl">
        <VendorForm />
      </div>
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
