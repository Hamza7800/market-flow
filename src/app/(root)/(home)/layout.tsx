import Navbar from "@/app/(root)/_components/navbar";
import type { ReactNode } from "react";

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Navbar />
      <main className="pt-20">{children}</main>
    </>
  );
};

export default RootLayout;
