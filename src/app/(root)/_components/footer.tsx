import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-surface border-border border-t">
      <div className="px-4 py-12 md:px-8">
        <div className="mx-auto max-w-7xl">
          {/* MAIN FOOTER CONTENT */}
          <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* COMPANY INFO */}
            <div>
              {/* <h3 className="text-foreground mb-4 flex items-center gap-4 text-lg font-bold"> */}
              <Image
                className="mb-4"
                width={120}
                height={120}
                alt="logo"
                src={"/market-flow-logo.png"}
              />
              {/* <span>MarketFlow</span> */}
              {/* </h3> */}
              <p className="text-muted mb-6 text-sm">
                Your trusted marketplace for quality products from verified
                vendors worldwide.
              </p>
              <div className="space-y-3">
                <div className="text-muted flex items-center gap-3 text-sm">
                  <MapPin size={18} className="text-accent flex-shrink-0" />
                  <span>123 Commerce Street, NY 10001</span>
                </div>
                <div className="text-muted flex items-center gap-3 text-sm">
                  <Phone size={18} className="text-accent flex-shrink-0" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="text-muted flex items-center gap-3 text-sm">
                  <Mail size={18} className="text-accent flex-shrink-0" />
                  <span>support@MarketFlow.com</span>
                </div>
              </div>
            </div>

            {/* QUICK LINKS */}
            <div>
              <h4 className="text-foreground mb-4 text-sm font-semibold tracking-wide uppercase">
                Quick Links
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/"
                    className="text-muted hover:text-accent text-sm transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    className="text-muted hover:text-accent text-sm transition-colors"
                  >
                    Browse Products
                  </Link>
                </li>
                <li>
                  <Link
                    href="/vendors"
                    className="text-muted hover:text-accent text-sm transition-colors"
                  >
                    Vendors
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-muted hover:text-accent text-sm transition-colors"
                  >
                    Daily Deals
                  </Link>
                </li>
              </ul>
            </div>

            {/* SUPPORT */}
            <div>
              <h4 className="text-foreground mb-4 text-sm font-semibold tracking-wide uppercase">
                Support
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/"
                    className="text-muted hover:text-accent text-sm transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-muted hover:text-accent text-sm transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-muted hover:text-accent text-sm transition-colors"
                  >
                    Shipping Info
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-muted hover:text-accent text-sm transition-colors"
                  >
                    Returns & Refunds
                  </Link>
                </li>
              </ul>
            </div>

            {/* POLICIES */}
            <div>
              <h4 className="text-foreground mb-4 text-sm font-semibold tracking-wide uppercase">
                Legal
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/"
                    className="text-muted hover:text-accent text-sm transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-muted hover:text-accent text-sm transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="border-border my-8 border-t" />

          {/* BOTTOM SECTION */}
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            {/* COPYRIGHT */}
            <p className="text-muted text-center text-sm md:text-left">
              &copy; 2026 MarketFlow. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
