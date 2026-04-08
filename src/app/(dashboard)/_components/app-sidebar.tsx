"use client";

import * as React from "react";
import { Command } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavMain } from "@/app/(dashboard)/_components/app-main";
import Link from "next/link";
import { NavUser } from "@/components/nav-user";
import Image from "next/image";
import { useVendor } from "@/hooks/use-vedor";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { profile } = useVendor();
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" className="flex items-center">
                <div className="text-sidebar-primary-foreground flex aspect-square size-12 items-center justify-center rounded-lg">
                  <Image
                    // className="mb-4"
                    width={70}
                    height={70}
                    alt="logo"
                    className="rounded-full"
                    src={profile?.logoUrl ?? "/market-flow-logo.png"}
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {profile?.storeName ?? "MarketFlow"}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
