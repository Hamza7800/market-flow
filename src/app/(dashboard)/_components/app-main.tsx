"use client";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Receipt, ShoppingBag } from "@gravity-ui/icons";
import Link from "next/link";
import { useParams } from "next/navigation";

const items = [
  {
    title: "Products",
    url: "products",
    icon: ShoppingBag,
  },
  {
    title: "Stripe",
    url: "stripe",
    icon: Receipt,
  },
];

export function NavMain() {
  const { vendorId } = useParams<{ vendorId: string }>();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild>
              <Link href={`/vendor/${vendorId}/dashboard/${item.url}`}>
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
            {/* {item.items?.length ? (
              <SidebarMenuSub key={item.title}>
                {item.items?.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton asChild>
                      <a href={subItem.url}>
                        <span>{subItem.title}</span>
                      </a>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            ) : null} */}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
