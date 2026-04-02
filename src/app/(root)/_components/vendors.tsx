"use client";

import Link from "next/link";
import { ArrowRight, Star, Store } from "lucide-react";
import { LinkButton } from "@/components/link-button";
import { usePublicVendors } from "@/hooks/use-public";

const Vendors = ({ slice = 6 }: { slice: number }) => {
  const { data: vendors } = usePublicVendors();
  console.log(vendors);
  return (
    <section className="py-16">
      <div className="">
        {/* HEADER */}
        <div className="mb-12">
          <h2 className="text-foreground mb-3 text-3xl font-bold md:text-4xl">
            Featured Vendors
          </h2>
          <p className="text-muted text-lg">
            Shop from trusted sellers and explore their exclusive collections
          </p>
        </div>

        {/* VENDORS GRID */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {vendors?.slice(0, slice)?.map((vendor) => (
            <div key={vendor.id} className="group">
              <div className="bg-surface border-border flex h-full flex-col overflow-hidden rounded-lg border transition-all duration-300 hover:shadow-lg">
                {/* VENDOR HEADER */}
                <div className="border-border border-b p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-accent/10 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg">
                      {vendor.logo ? (
                        <img src={vendor.logo} alt="" className="rounded-sm" />
                      ) : (
                        <Store size={24} className="text-accent" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-foreground group-hover:text-accent truncate text-lg font-semibold transition-colors">
                        {vendor.storeName}
                      </h3>
                      <p className="text-muted mt-1 text-sm">
                        {vendor.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* STATS */}
                <div className="border-border grid grid-cols-2 gap-4 border-b px-6 py-4">
                  <div className="text-center">
                    <div className="text-foreground text-lg font-bold">
                      {vendor.rating}
                    </div>
                    <div className="mt-1 flex items-center justify-center gap-1">
                      <Star size={14} className="fill-accent text-accent" />
                      <span className="text-muted text-xs">Rating</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-foreground text-lg font-bold">
                      {(vendor.productCount || 0).toLocaleString()}
                    </div>
                    <span className="text-muted text-xs">Products</span>
                  </div>
                  {/* <div className="text-center">
                    <div className="text-foreground text-lg font-bold">
                      {((vendor.followers || 0) / 1000).toFixed(1)}k
                    </div>
                    <span className="text-muted text-xs">Followers</span>
                  </div> */}
                </div>

                {/* CTA */}
                <div className="flex flex-1 items-end p-6">
                  <LinkButton
                    href={`/vendor/${vendor.id}`}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground group/btn w-full cursor-pointer font-medium"
                  >
                    Visit Store
                    <ArrowRight
                      size={16}
                      className="ml-2 transition-transform group-hover/btn:translate-x-1"
                    />
                  </LinkButton>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* VIEW ALL LINK */}
        <div className="mt-12 text-center">
          <LinkButton
            href="/vendors"
            variant="outline"
            className="inline-flex items-center gap-2 font-semibold transition-all hover:gap-3"
          >
            Browse All Vendors
            <ArrowRight size={20} />
          </LinkButton>
        </div>
      </div>
    </section>
  );
};

export default Vendors;
