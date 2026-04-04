import Navbar from "@/app/(root)/_components/navbar";
import { Suspense, type ReactNode } from "react";
import { Footer } from "@/app/(root)/_components/footer";

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <Suspense>
      <Navbar />
      <main className="pt-20">{children}</main>
      <Footer />
    </Suspense>
  );
};

export default RootLayout;
