"use client";

import { useVendor } from "@/hooks/use-vedor";
import { authClient } from "@/server/better-auth/client";
import {
  ArrowRightFromSquare,
  SquareBars,
  Person,
  ShoppingBasket,
} from "@gravity-ui/icons";
import { Button, Dropdown, Label } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { Truck } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";

const UserLinks = () => {
  const router = useRouter();
  const qc = useQueryClient();
  const { isActive, profile } = useVendor();
  const { data } = authClient.useSession();
  const isAuthenticated = !!data?.user;

  const handleSignOut = async () => {
    await authClient.signOut();
    qc.resetQueries();
    router.replace("/");
  };

  return (
    <Dropdown>
      <Button aria-label="Menu" variant="outline">
        <Person />
      </Button>
      <Dropdown.Popover placement="bottom right">
        <Dropdown.Menu>
          {isAuthenticated ? (
            <>
              <Dropdown.Item
                key="my-orders"
                onClick={() => {
                  router.push(`/user/${data.user?.id}/orders`);
                }}
                id="my-orders"
                textValue="My Orders"
              >
                <Truck className="text-muted size-4 shrink-0" />
                <Label>My Orders</Label>
              </Dropdown.Item>

              {isActive ? (
                <Dropdown.Item
                  key="dashboard"
                  onClick={() => {
                    router.push(`/vendor/${profile?.id}/dashboard`);
                  }}
                  id="dashboard"
                  textValue="Dashboard"
                >
                  <SquareBars className="text-muted size-4 shrink-0" />
                  <Label>Dashboard</Label>
                </Dropdown.Item>
              ) : (
                <Dropdown.Item
                  key="become-a-vendor"
                  id="become-a-vendor"
                  textValue="Become a vendor"
                  onClick={() => {
                    router.push("/vendor-onboarding");
                  }}
                >
                  <ShoppingBasket className="text-muted size-4 shrink-0" />
                  <Label>Become a vendor</Label>
                </Dropdown.Item>
              )}

              <Dropdown.Item
                key="logout-user"
                onClick={handleSignOut}
                id="logout-user"
                textValue="Logout user"
                variant="danger"
              >
                <ArrowRightFromSquare className="text-danger size-4 shrink-0" />
                <Label>Logout</Label>
              </Dropdown.Item>
            </>
          ) : (
            <>
              <Dropdown.Item
                key="login"
                id="login"
                textValue="Login"
                onClick={() => {
                  router.push("/sign-in");
                }}
              >
                <ArrowRightFromSquare className="text-muted size-4 shrink-0" />
                <Label>Login</Label>
              </Dropdown.Item>
            </>
          )}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
};

export default UserLinks;
