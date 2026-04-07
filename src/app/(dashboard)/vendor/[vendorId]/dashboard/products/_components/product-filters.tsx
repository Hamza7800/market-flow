"use client";

import { LinkButton } from "@/components/link-button";
import {
  clientProductParams,
  type MinRating,
  type PriceSort,
} from "@/lib/nuqs/product";
import { cn, Input, Label, ListBox, Select } from "@heroui/react";
import { useQueryStates } from "nuqs";

const ProductFilters = ({ vendorId }: { vendorId: string }) => {
  const [{ search, priceSort, minRating }, setClientQuery] = useQueryStates(
    clientProductParams,
    { history: "replace", shallow: true },
  );

  const handleClientChange = (
    key: "search" | "priceSort" | "minRating",
    val: string,
  ) => {
    setClientQuery({ [key]: val || null }); // null removes param from URL
  };

  return (
    <FilterToolbar
      search={search ?? ""}
      priceSort={(priceSort as PriceSort) ?? "none"}
      minRating={(minRating as MinRating) ?? "none"}
      onClientChange={handleClientChange}
      vendorId={vendorId}
    />
  );
};

export default ProductFilters;

const PRICE_OPTIONS: { id: PriceSort; name: string }[] = [
  { id: "none", name: "Price: All" },
  { id: "asc", name: "Price: Low → High" },
  { id: "desc", name: "Price: High → Low" },
];

const RATING_OPTIONS: { id: MinRating; name: string }[] = [
  { id: "none", name: "Rating: All" },
  { id: "3", name: "⭐ 3.0 & up" },
  { id: "4", name: "⭐ 4.0 & up" },
  { id: "4.5", name: "⭐ 4.5 & up" },
];

type FilterToolbarProps = {
  search: string;
  priceSort: PriceSort;
  minRating: MinRating;
  onClientChange: (
    key: "search" | "priceSort" | "minRating",
    val: string,
  ) => void;
  vendorId: string;
};

function FilterToolbar({
  search,
  priceSort,
  minRating,
  onClientChange,
  vendorId,
}: FilterToolbarProps) {
  return (
    <div className="flex w-full flex-col gap-2 md:flex-row md:items-center">
      <Input
        placeholder="Search by name…"
        value={search}
        className={"border-border w-full border shadow-none md:w-[250px]"}
        onChange={(e) => onClientChange("search", e.target.value)}
      />

      <FilterSelect
        label="Price sort"
        value={priceSort}
        onChange={(v) => onClientChange("priceSort", v)}
        options={PRICE_OPTIONS}
        className="md:w-[170px]"
      />

      <FilterSelect
        label="Min rating"
        value={minRating}
        onChange={(v) => onClientChange("minRating", v)}
        options={RATING_OPTIONS}
        className="md:w-[150px]"
      />
    </div>
  );
}

function FilterSelect<T extends string>({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: T;
  onChange: (val: T) => void;
  options: { id: T; name: string }[];
  className?: string;
}) {
  return (
    <Select
      fullWidth
      className={cn("w-full min-w-[200px]", className)}
      value={value}
      onChange={(val) => {
        if (val) onChange(val as T);
      }}
    >
      <Label className="sr-only">{label}</Label>
      <Select.Trigger
        className={"border-border border shadow-none"}
        // className="border-default-200 bg-default-50 h-8 min-h-0 rounded-lg border px-3 text-sm shadow-none"
      >
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {options.map((opt) => (
            <ListBox.Item key={opt.id} id={opt.id} textValue={opt.name}>
              {opt.name}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
