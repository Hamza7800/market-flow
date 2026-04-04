"use client";

import VendorForm from "@/components/vendor-form";
import { useVendorProfile } from "@/hooks/use-vedor";

const StoreSettings = () => {
  const { data } = useVendorProfile();
  if (!data) return null;

  return (
    <div>
      <VendorForm initialData={data} />
    </div>
  );
};

export default StoreSettings;
