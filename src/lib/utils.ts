import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import z from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const returnError = (error: any, message: string) => {
  console.error(message, error);

  let errorMessage = message;

  if (error?.body?.message) {
    errorMessage = error.body.message;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (error instanceof z.ZodError) {
    errorMessage = error.message;
  }

  return {
    success: false,
    message: errorMessage,
    data: null,
  };
};

export const formatMoney = (value: string) => `$${Number(value).toFixed(2)}`;
