"use client";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@heroui/react";
import type { ReactNode } from "react";
import { AppSidebar } from "../_components/app-sidebar";
import { authClient } from "@/server/better-auth/client";
import { LoadingState } from "@/components/loading-state";
import { EmptyState } from "@/components/empty-state";
import { AlertCircleIcon } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { usePathname } from "next/navigation";

export default function Page({ children }: { children: ReactNode }) {
  const { data: userAuth, isPending } = authClient.useSession();
  const userId = userAuth?.user.id;
  const router = useRouter();
  const pathname = usePathname();

  if (isPending) {
    return (
      <div className="h-dvh">
        <LoadingState />
      </div>
    );
  }

  if (!userId && !isPending) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <EmptyState
          icon={AlertCircleIcon}
          title="Login"
          className="border-border w-fit border bg-white"
          description="Please login to continue"
          action={{
            label: "Sign In",
            onClick: () =>
              router.push(`/sign-in?redirect=${encodeURIComponent(pathname)}`),
          }}
        />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>
        <Separator />
        <div className="flex flex-1 flex-col gap-4 p-3 pt-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
