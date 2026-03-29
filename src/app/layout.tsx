import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import Providers from "@/app/providers";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Shop Forge",
  description: "Shop Forge",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn(geist.variable, "font-sans", inter.variable)}>
      <body cz-shortcut-listen="true">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
