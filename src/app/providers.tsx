"use client";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { VendorProvider } from "@/components/context/vendor-context";
import ReactQueryProvider from "@/components/react-query/provider";
import { Toast } from "@heroui/react";
import NextTopLoader from "nextjs-toploader";
import type { ReactNode } from "react";

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <NuqsAdapter>
      <ReactQueryProvider>
        <VendorProvider>{children}</VendorProvider>
        <Toast.Provider placement="bottom end" />
        <NextTopLoader />
      </ReactQueryProvider>
    </NuqsAdapter>
  );
};

export default Providers;
