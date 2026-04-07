"use client";

import { ArrowRight, Star, Store } from "lucide-react";
import { LinkButton } from "@/components/link-button";
import { usePublicVendors } from "@/hooks/use-public";
import { Card, Separator } from "@heroui/react";
import PublicVendorsLoading from "@/components/loading-skeletons/public-vendors-loading";

const Vendors = ({ slice }: { slice?: number }) => {
  const { data: vendors, isPending } = usePublicVendors();
  const v = slice ? vendors?.slice(0, slice) : vendors;

  if (isPending) {
    return <PublicVendorsLoading />;
  }

  return (
    <section className="py-4 pb-14">
      <div className="">
        <div className="mb-8">
          <h2 className="text-foreground mb-3 text-3xl font-bold md:text-4xl">
            Featured Vendors
          </h2>
          <p className="text-muted text-lg">
            Shop from trusted sellers and explore their exclusive collections
          </p>
        </div>

        {/* VENDORS GRID */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {v?.map((vendor) => (
            <div key={vendor.id} className="group">
              <Card className="flex h-full border transition-all duration-300">
                {/* VENDOR HEADER */}
                <Card.Header className="">
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
                </Card.Header>
                <Separator />

                {/* STATS */}
                <Card.Content className="grid grid-cols-2 gap-4 px-6">
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
                </Card.Content>

                <Separator />
                <Card.Footer className="flex flex-1 items-end">
                  <LinkButton
                    href={`/vendors/${vendor.id}`}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground group/btn w-full cursor-pointer font-medium"
                  >
                    Visit Store
                    <ArrowRight
                      size={16}
                      className="ml-2 transition-transform group-hover/btn:translate-x-1"
                    />
                  </LinkButton>
                </Card.Footer>
              </Card>
            </div>
          ))}
        </div>

        {/* VIEW ALL LINK */}
        {slice && (
          <div className="mt-12 text-center">
            <LinkButton
              href="/vendors"
              variant="outline"
              className="inline-flex items-center gap-2 bg-white font-semibold transition-all hover:gap-3"
            >
              Browse All Vendors
              {/* <ArrowRight size={20} /> */}
            </LinkButton>
          </div>
        )}
      </div>
    </section>
  );
};

export default Vendors;
