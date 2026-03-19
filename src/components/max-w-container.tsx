import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = {
  className?: string;
  children: ReactNode;
};
const MaxWidthContainer = ({ className, children }: Props) => {
  return (
    <div
      style={{ isolation: "isolate" }}
      className={cn("mx-auto w-full max-w-[1450px] px-4", className)}
    >
      {children}
    </div>
  );
};

export default MaxWidthContainer;
