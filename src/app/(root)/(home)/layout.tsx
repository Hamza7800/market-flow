import Navbar from "@/app/(root)/_components/navbar";
import type { ReactNode } from "react";
import { Footer } from "@/app/(root)/_components/footer";

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Navbar />
      <main className="pt-20">{children}</main>
      <Footer />
    </>
  );
};

export default RootLayout;
