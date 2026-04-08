import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star, Store, MessageCircle, Shield } from "lucide-react";
import { LinkButton } from "@/components/link-button";
import { Card, Separator, Surface } from "@heroui/react";
import type { ProductDetail } from "@/actions/public";

// interface VendorInfo {
//   id: string;
//   storeName: string;
//   description?: string;
//   rating?: number | string;
//   productCount?: number;
//   followers?: number;
// }

interface ProductVendorCardProps {
  vendor: NonNullable<ProductDetail["vendor"]>;
}

const ProductVendorCard = ({ vendor }: ProductVendorCardProps) => {
  const rating = Number(4.5);

  return (
    <Card className="mt-4 p-0 pb-1 shadow-none">
      <Card.Header>
        <h3 className="text-foreground text-lg font-semibold">Seller Info</h3>
      </Card.Header>

      <Card.Content>
        <div className="border-border mb-2 flex items-start gap-4 border-b pb-6">
          <div className="bg-accent/10 border-border flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg border">
            {/* <Store size={32} className="text-accent" /> */}
            {vendor.logoUrl ? (
              <img src={vendor.logoUrl} alt="" className="rounded-sm" />
            ) : (
              <Store size={24} className="text-accent" />
            )}
          </div>
          <div className="flex-1">
            <Link
              href={`/vendors/${vendor.id}`}
              className="text-foreground hover:text-accent mb-1 block text-lg font-bold transition-colors"
            >
              {vendor.storeName}
            </Link>
            <p className="text-muted line-clamp-2 text-sm">
              {vendor.description || "Premium products from trusted seller"}
            </p>
          </div>
        </div>
        {/* <div className="border-border mb-2 grid grid-cols-2 gap-4 border-b pb-6"> */}
        {/* <div className="text-center">
            <div className="mb-1 flex items-center justify-center gap-1">
              <Star size={16} className="fill-accent text-accent" />
              <span className="text-foreground text-sm font-bold">
                {rating}
              </span>
            </div>
            <p className="text-muted text-xs">Rating</p>
          </div> */}
        {/* <div className="text-center">
            <div className="text-foreground mb-1 text-sm font-bold">
              {(vendor.productCount ?? 0).toLocaleString()}
            </div>
            <p className="text-muted text-xs">Products</p>
          </div> */}
        {/* </div> */}
        <div className="flex items-center justify-between">
          <div className="text-muted flex items-center gap-2 text-sm">
            <Shield size={16} className="text-accent" />
            <span>Trusted Seller</span>
          </div>
          <div className="text-muted flex items-center gap-2 text-sm">
            <MessageCircle size={16} className="text-accent" />
            <span>Fast Response</span>
          </div>
        </div>
      </Card.Content>
      <Separator />

      <Card.Footer>
        <LinkButton
          href={`/vendors/${vendor.id}`}
          fullWidth
          // className="bg-accent hover:bg-accent/90 text-accent-foreground w-full cursor-pointer font-medium"
        >
          View Store
        </LinkButton>
      </Card.Footer>
    </Card>
  );
};

export default ProductVendorCard;
