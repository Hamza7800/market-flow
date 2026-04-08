import { Button, Drawer, useOverlayState } from "@heroui/react";
import {
  Bars,
  Bell,
  Envelope,
  Gear,
  House,
  Magnifier,
  Person,
} from "@gravity-ui/icons";
import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import { Box, Store } from "lucide-react";

const navItems: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  href: string;
}[] = [
  { icon: House, label: "Home", href: "/" },
  { icon: Box, label: "Products", href: "/products" },
  { icon: Store, label: "Vendors", href: "/vendors" },
  // { icon: Magnifier, label: "Search", href: "" },
  // { icon: Bell, label: "Notifications", href: "" },
  // { icon: Envelope, label: "Messages", href: "" },
  // { icon: Person, label: "Profile", href: "" },
  // { icon: Gear, label: "Settings", href: "" },
];

const MobileDrawer = () => {
  const state = useOverlayState();

  return (
    <Drawer isOpen={state.isOpen} onOpenChange={state.setOpen}>
      <Button variant="outline">
        <Bars />
      </Button>
      <Drawer.Backdrop>
        <Drawer.Content className={"z-[110]"} placement="left">
          <Drawer.Dialog>
            <Drawer.CloseTrigger />
            <Drawer.Header>
              <Drawer.Heading>MarketFlow</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body>
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link
                    onClick={() => state.close()}
                    href={item.href}
                    key={item.label}
                    className="text-foreground hover:bg-default flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors"
                    type="button"
                  >
                    <item.icon className="text-muted size-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
};

export default MobileDrawer;
