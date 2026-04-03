"use client";

import { Suspense, useEffect, useState } from "react";
import Header from "@/app/(root)/_components/header";
import MaxWidthContainer from "@/components/max-w-container";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      // className={cn(
      //   "fixed left-0 right-0 top-0 z-50 px-6 py-4 transition-all duration-300 ease-in-out md:px-10",
      //   isScrolled
      //     ? "glass-dark bg-app-bg-primary/70 shadow-sm backdrop-blur-xl"
      //     : "bg-transparent",
      // )}
      className={cn(
        "fixed top-0 right-0 left-0 z-[5] border-b px-2 py-3 shadow backdrop-blur-2xl transition-all duration-300 ease-in-out",
      )}
      // className="fixed left-0 top-0 z-50 flex h-[10vh] w-full items-center border-b border-b-app-border-primary bg-app-bg-primary"
    >
      <MaxWidthContainer>
        <Suspense>
          <Header />
        </Suspense>
      </MaxWidthContainer>
    </div>
  );
}
