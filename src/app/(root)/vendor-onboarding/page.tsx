import { isVendor } from "@/actions/vendor";
import MaxWidthContainer from "@/components/max-w-container";
import VendorForm from "@/components/vendor-form";
import { redirect } from "next/navigation";

const VendorOnboarding = async () => {
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

export default VendorOnboarding;
