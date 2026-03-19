import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  href?: string;
  className?: string;
  children: ReactNode;
  asChild?: boolean;
};

const NavLink = ({ href, className, children, asChild = false }: Props) => {
  return (
    <Link
      href={href ?? "/"}
      // className={cn(
      //   "text-md flex h-[40px] items-center justify-center rounded-[8px] bg-transparent px-[12px] py-0 font-medium text-app-text-tertiary transition-all duration-200 hover:bg-app-brand-bg hover:text-app-text-primary",
      //   // hover:bg-app-bg-secondary
      //   className,
      // )}
      className={cn(
        "text-md hover:border-app-text-quaternary hover:text-app-text-primary flex h-[40px] items-center justify-center rounded-[12px] border border-transparent bg-transparent px-[20px] py-6 font-medium transition-all duration-200 hover:bg-[#2c2c2c]/10",
        // hover:bg-app-bg-secondary
        className,
      )}
    >
      {children}
    </Link>
  );
};

export default NavLink;
