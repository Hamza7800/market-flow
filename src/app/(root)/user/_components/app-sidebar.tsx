"use client";

import { Command, Truck, User } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavMain } from "@/app/(root)/user/_components/app-main";
import { NavUser } from "@/components/nav-user";
import Link from "next/link";
import type { ComponentProps } from "react";
import Image from "next/image";

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
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
                    src={"/market-flow-logo.png"}
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">MarketFlow</span>
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
