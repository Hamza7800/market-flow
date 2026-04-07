"use client";

import VendorForm from "@/components/vendor-form";
import { useVendorProfile } from "@/hooks/use-vedor";

const StoreSettings = () => {
  const { data } = useVendorProfile();
  if (!data) return null;

  return (
    <div>
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">
            Store Settings
          </h1>
          <p className="text-muted mt-1 text-sm">Manage your store info.</p>
        </div>
      </div>
      <VendorForm initialData={data} />
    </div>
  );
};

export default StoreSettings;
