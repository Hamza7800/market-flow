"use client";

import { Card, Button, toast } from "@heroui/react";
import { Copy, CreditCard, Info } from "lucide-react";

export const StripeTestCard = () => {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <Card className="border-none p-0.5 shadow-none">
      <div className="flex items-start gap-3">
        {/* <div className="mt-1 rounded-full bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
          <Info size={18} />
        </div> */}
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Test Mode Enabled
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Use the card below to simulate a successful payment.
          </p>

          <div className="mt-4 flex flex-col gap-2">
            {/* Card Number Row */}
            <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center gap-3">
                <CreditCard size={16} className="text-zinc-400" />
                <code className="font-mono text-sm text-zinc-700 dark:text-zinc-300">
                  4242 4242 4242 4242
                </code>
              </div>
              <Button
                isIconOnly
                size="sm"
                onClick={() =>
                  copyToClipboard("4242424242424242", "Card number")
                }
              >
                <Copy size={14} />
              </Button>
            </div>

            {/* Exp & CVC Row */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-[10px] text-zinc-400 uppercase">Expiry</p>
                <p className="font-mono text-sm text-zinc-700 dark:text-zinc-300">
                  12 / 26
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-[10px] text-zinc-400 uppercase">CVC</p>
                <p className="font-mono text-sm text-zinc-700 dark:text-zinc-300">
                  123
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
