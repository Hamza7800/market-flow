"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@heroui/react";
import { MenuIcon, X } from "lucide-react";
import { authClient } from "@/server/better-auth/client";
import NavLink from "@/app/(root)/_components/nav-link";
import MobileDrawer from "./mobile-drawer";
import CartDrawer from "./cart-drawer";
import UserLinks from "./user-links";

const navLinks = [
  { href: "/items", label: "Items" },
  { href: "/shirts", label: "Shirts" },
  { href: "/support", label: "Support" },
];

const Header = () => {
  const pathname = usePathname();

  return (
    <header className="flex h-full w-full items-center">
      {/* ── Mobile ── */}
      <div className="flex w-full items-center justify-between lg:hidden">
        <MobileDrawer />
        <Link href="/" className="text-3xl font-bold">
          LOGO
          <span className="sr-only">LOGO</span>
        </Link>
        <div className="w-8" />
      </div>

      {/* ── Desktop Navigation ── */}
      <nav className="mx-auto hidden w-full items-center justify-between gap-2 lg:flex">
        <Link href="/" className="mr-6 text-xl font-bold">
          LOGO
          <span className="sr-only">LOGO</span>
        </Link>

        <div className="flex w-full items-center justify-center gap-2">
          {navLinks.map((link, index) => (
            <NavLink
              key={index}
              href={link.href}
              className={
                pathname.includes(link.href)
                  ? "border-app-text-quaternary"
                  : "border-transparent"
              }
            >
              {link.label}
            </NavLink>
          ))}

          {/* {isAuthenticated ? (
            <>
              <Button
                onPress={handleSignOut}
                className="text-md flex h-[40px] items-center justify-center rounded-[12px] border border-transparent bg-transparent px-[20px] py-6 font-medium text-black transition-all duration-200 hover:bg-[#2c2c2c]/10"
              >
                Logout
              </Button>
              <NavLink
                href="/dashboard"
                className="text-md flex h-[40px] items-center justify-center rounded-[12px] border border-t-white/20 border-l-white/20 bg-white px-[25px] py-6 font-medium text-black transition-all duration-200 hover:bg-[#e7e7e7] hover:text-black"
              >
                Dashboard
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
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
              </NavLink>
            </>
          )} */}
        </div>
        <div className="flex items-center gap-2">
          <CartDrawer />
          <UserLinks />
        </div>
      </nav>
    </header>
  );
};

export default Header;
