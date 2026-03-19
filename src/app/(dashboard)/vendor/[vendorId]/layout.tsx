import type { ReactNode } from "react";
import VendorDashboardGuard from "@/app/(dashboard)/_components/vendor-dashboard-guard";

type Props = {
  children: ReactNode;
  params: Promise<{ vendorId: string }>;
};
const VendorLayout = async ({ children, params }: Props) => {
  const { vendorId } = await params;

  return (
    <VendorDashboardGuard vendorId={vendorId}>{children}</VendorDashboardGuard>
  );
};

export default VendorLayout;
