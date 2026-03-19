import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const blurEffect = `relative z-30 flex flex-col items-center justify-center border-b border-t border-[#ffff]/10 bg-[#1c1c1c]/40 text-center backdrop-blur-3xl transition-all duration-300 ease-in-out`;
