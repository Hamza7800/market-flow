import { Badge } from "@heroui/react";
import { useState } from "react";

interface Variant {
  id: string;
  name: string;
  options: string;
  price: number | string;
  stock: number;
  sku?: string;
  imageUrl?: string;
}

interface ProductVariantsProps {
  variants: Variant[];
  hasVariants: boolean;
  basePrice: number | string;
  onVariantSelect: (variant: Variant) => void;
}

export function ProductVariants({
  variants,
  hasVariants,
  basePrice,
  onVariantSelect,
}: ProductVariantsProps) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  if (!hasVariants || !variants || variants.length === 0) {
    return null;
  }

  const handleSelectVariant = (variant: Variant) => {
    setSelectedVariant(variant);
    onVariantSelect(variant);
  };

  return (
    <div className="space-y-4 overflow-x-hidden">
      <div>
        <h3 className="text-foreground mb-3 text-lg font-semibold">
          Select Options
        </h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {variants.map((variant) => (
            <button
              key={variant.id}
              onClick={() => handleSelectVariant(variant)}
              className={`rounded-lg border-2 p-4 text-left transition-all ${
                selectedVariant?.id === variant.id
                  ? "border-accent bg-accent/5"
                  : "border-border hover:border-accent/50"
              }`}
            >
              <div className="text-foreground mb-1 text-sm font-medium">
                {variant.name}
              </div>
              <div className="text-muted mb-2 text-xs">{variant.options}</div>
              <div className="flex items-center justify-between">
                <span className="text-accent text-sm font-semibold">
                  ${Number(variant.price).toFixed(2)}
                </span>
                {variant.stock > 0 ? (
                  <Badge className="text-xs">{variant.stock} left</Badge>
                ) : (
                  <Badge className="text-xs text-red-600">Out of stock</Badge>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
