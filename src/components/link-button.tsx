"use client";
import type { ButtonProps } from "@heroui/react";
import type { VariantProps } from "tailwind-variants";

import { Button, buttonVariants } from "@heroui/react";
import { tv } from "tailwind-variants";
import { useRouter } from "next/navigation";

const myButtonVariants = tv({
  base: "text-md font-semibold shadow-md text-shadow-lg data-[pending=true]:opacity-40",
  defaultVariants: {
    radius: "lg",
    variant: "primary",
  },
  extend: buttonVariants,
  variants: {
    radius: {
      full: "rounded-full",
      lg: "rounded-lg",
      md: "rounded-md",
      sm: "rounded-sm",
    },
    size: {
      lg: "h-12 px-8",
      md: "h-11 px-6",
      sm: "h-10 px-4",
      xl: "h-13 px-10",
    },
    variant: {
      primary:
        "text-white dark:bg-white/10 dark:text-white dark:hover:bg-white/15",
    },
  },
});

type MyButtonVariants = VariantProps<typeof myButtonVariants>;
export type MyButtonProps = Omit<ButtonProps, "className"> &
  MyButtonVariants & { className?: string; href: string };

export function LinkButton({
  className,
  href,
  radius,
  children,
  variant,
  ...props
}: MyButtonProps) {
  const router = useRouter();
  return (
    <Button
      onPress={() => {
        if (href) router.push(href);
      }}
      className={myButtonVariants({ className, radius, variant })}
      {...props}
    >
      {children}
    </Button>
  );
}
