import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import Providers from "@/app/providers";
import { cn } from "@/lib/utils";
import ScrollToTop from "@/components/scroll-to-top";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "MarketFlow",
  description:
    "MarketFlow is a modern multi-vendor marketplace platform where businesses launch, manage, and scale their online stores seamlessly.",
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
      <head>
        <meta name="apple-mobile-web-app-title" content="Market Flow" />
      </head>
      <body cz-shortcut-listen="true">
        <ScrollToTop />
        {/* <Suspense> */}
        <Providers>{children}</Providers>
        {/* </Suspense> */}
      </body>
    </html>
  );
}
