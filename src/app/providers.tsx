"use client";

import ReactQueryProvider from "@/components/react-query/provider";
import { Toast } from "@heroui/react";
import type { ReactNode } from "react";

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <ReactQueryProvider>
      {children}
      <Toast.Provider />
    </ReactQueryProvider>
  );
};

export default Providers;
