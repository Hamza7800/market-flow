"use client";

import { VendorProvider } from "@/components/context/vendor-context";
import ReactQueryProvider from "@/components/react-query/provider";
import { Toast } from "@heroui/react";
import NextTopLoader from "nextjs-toploader";
import type { ReactNode } from "react";

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <ReactQueryProvider>
      <VendorProvider>{children}</VendorProvider>
      <Toast.Provider placement="bottom end" />
      <NextTopLoader />
    </ReactQueryProvider>
  );
};

export default Providers;
