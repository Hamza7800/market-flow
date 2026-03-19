import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@heroui/react";
import type { ReactNode } from "react";
import { AppSidebar } from "../_components/app-sidebar";

export default function Page({ children }: { children: ReactNode }) {
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
