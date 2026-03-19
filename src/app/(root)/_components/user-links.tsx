"use client";

import { authClient } from "@/server/better-auth/client";
import {
  ArrowRightFromSquare,
  SquareBars,
  Person,
  ShoppingBasket,
} from "@gravity-ui/icons";
import { Button, Dropdown, Label } from "@heroui/react";
import { useRouter } from "nextjs-toploader/app";

const UserLinks = () => {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session?.user;

  const handleSignOut = async () => {
    await authClient.signOut();
  };

  return (
    <Dropdown>
      <Button aria-label="Menu" variant="outline">
        <Person />
      </Button>
      <Dropdown.Popover placement="bottom right">
        <Dropdown.Menu onAction={(key) => console.log(`Selected: ${key}`)}>
          <Dropdown.Item
            id="become-a-vendor"
            textValue="Become a vendor"
            onClick={() => {
              router.push("/vendor-onboarding");
            }}
          >
            <ShoppingBasket className="text-muted size-4 shrink-0" />
            <Label>Become a vendor</Label>
          </Dropdown.Item>

          <Dropdown.Item
            id="login"
            textValue="Login"
            onClick={() => {
              router.push("/sign-in");
            }}
          >
            <ArrowRightFromSquare className="text-muted size-4 shrink-0" />
            <Label>Login</Label>
          </Dropdown.Item>

          {isAuthenticated ? (
            <>
              <Dropdown.Item id="profile" textValue="Profile">
                <Person className="text-muted size-4 shrink-0" />
                <Label>Profile</Label>
              </Dropdown.Item>
              <Dropdown.Item id="dashboard" textValue="Dashboard">
                <SquareBars className="text-muted size-4 shrink-0" />
                <Label>Dashboard</Label>
              </Dropdown.Item>
              <Dropdown.Item
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
              {/* <NavLink
                href="/sign-in"
                className="text-md hover:border-app-text-quaternary hover:text-app-text-primary flex h-[40px] items-center justify-center rounded-[12px] border border-transparent bg-transparent px-[20px] py-6 font-medium transition-all duration-200 hover:bg-[#2c2c2c]/50"
              >
                Login
              </NavLink>
              <NavLink
                href="/register"
                className="text-md flex h-[40px] items-center justify-center rounded-[12px] border border-t-white/20 border-l-white/20 bg-white px-[20px] py-6 font-medium text-black transition-all duration-200 hover:bg-[#e7e7e7] hover:text-black"
              >
                Create Account
              </NavLink> */}
            </>
          )}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
};

export default UserLinks;
