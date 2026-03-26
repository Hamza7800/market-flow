"use client";

import { Settings, Truck, type LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useParams } from "next/navigation";
import Link from "next/link";

const items = [
  {
    title: "Orders",
    url: "orders",
    icon: Truck,
  },
  {
    title: "Settings",
    url: "settings",
    icon: Settings,
  },
];

export function NavMain() {
  const { userId } = useParams<{ userId: string }>();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild>
              <Link href={`/user/${userId}/${item.url}`}>
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
