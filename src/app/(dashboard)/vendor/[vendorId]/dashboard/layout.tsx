import { AppSidebar } from "@/app/(dashboard)/_components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@heroui/react";
import type { ReactNode } from "react";

export default function Page({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-10 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <h2>Dashboard</h2>
          </div>
        </header>
        <Separator />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
