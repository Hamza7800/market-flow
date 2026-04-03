"use client";

import Vendors from "@/app/(root)/_components/vendors";
import { ArrowRight } from "lucide-react";

const AllVendors = () => {
  return (
    <div>
      <Vendors />
      <section className="py-16">
        <div className="text-center">
          <h2 className="text-foreground mb-4 text-3xl font-bold md:text-4xl">
            Are you a Vendor?
          </h2>
          <p className="text-muted mb-8 text-lg">
            Join our community of successful sellers and reach millions of
            customers
          </p>
          <a
            href="/vendor-onboarding"
            className="bg-accent hover:bg-accent/90 text-accent-foreground inline-flex cursor-pointer items-center gap-2 rounded-lg px-8 py-3 font-semibold transition-all"
          >
            Become a Vendor
            <ArrowRight size={20} />
          </a>
        </div>
      </section>
    </div>
  );
};

export default AllVendors;
