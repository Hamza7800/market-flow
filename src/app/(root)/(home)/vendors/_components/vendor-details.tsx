"use client";

import { useVendorPublic } from "@/hooks/use-public";

const VendorDetails = ({ vendorId }: { vendorId: string }) => {
  const { data } = useVendorPublic(vendorId);
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
};

export default VendorDetails;
