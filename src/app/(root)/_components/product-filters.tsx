"use client";

import ProductFiltersSkeleton from "@/components/loading-skeletons/filters-loading";
import { useCategories } from "@/hooks/use-public";
import {
  browseClientParams,
  browseServerParams,
  // SORT_LABELS,
  // SORT_OPTIONS,
  // type SortOption,
} from "@/lib/nuqs/public";
import {
  // Input,
  // Label,
  // Separator,
  Skeleton,
  Tag,
  TagGroup,
  // Select,
  // ListBox,
  // NumberField,
  // Checkbox,
  // Button,
} from "@heroui/react";
import { useQueryStates } from "nuqs";
import { useState, useTransition } from "react";

const ProductFilters = () => {
  const { data: categories, isLoading: catsLoading } = useCategories();

  const [{ category, sort, inStock, page }, setServerState] = useQueryStates(
    browseServerParams,
    { history: "push", shallow: false },
  );

  const [{ minPrice, maxPrice, search }, setClientState] = useQueryStates(
    browseClientParams,
    { history: "replace", shallow: true },
  );

  // const [searchInput, setSearchInput] = useState(search ?? "");
  // const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  // useEffect(() => {
  //   clearTimeout(searchTimer.current);
  //   searchTimer.current = setTimeout(() => {
  //     setClientState({ search: searchInput || "" });
  //   }, 400);
  //   return () => clearTimeout(searchTimer.current);
  // }, [searchInput]);

  const [isPending, startTransition] = useTransition();

  // const activeFiltersCount = [
  //   category,
  //   sort !== "newest" ? sort : null,
  //   minPrice ? minPrice : null,
  //   maxPrice ? maxPrice : null,
  //   inStock === "false" ? "inStock" : null,
  //   search ? search : null,
  // ].filter(Boolean).length;

  // const hasMore = true;

  // const resetAll = () => {
  //   startTransition(() => {
  //     setServerState({
  //       category: "",
  //       sort: "newest",
  //       inStock: "true",
  //       page: 1,
  //     });
  //     setClientState({ minPrice: 0, maxPrice: 0, search: "" });
  //     setSearchInput("");
  //   });
  // };

  if (catsLoading) {
    return <ProductFiltersSkeleton />;
  }

  return (
    <div className="mb-6 w-full">
      {/* ── Search ──────────────────────────────────────────────────────── */}
      <div className="flex w-full items-end gap-2">
        {/* <div className="w-full">
          <Label className="text-default-500 mb-1.5 block text-xs font-semibold tracking-wide uppercase">
            Search
          </Label>
          <Input
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
        
            className="w-full"
          />
        </div> */}
        {/* <div className="w-full max-w-sm">
          <Select
            fullWidth
            value={sort ?? "newest"}
            onChange={(key) =>
              startTransition(() => {
                setServerState({ sort: key as SortOption, page: 1 });
              })
            }
            className="min-w-xs"
          >
            <Label>Sort by</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {SORT_OPTIONS.map((s) => (
                  <ListBox.Item key={s} id={s} textValue={SORT_LABELS[s]}>
                    <Label>{SORT_LABELS[s]}</Label>
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </div> */}

        {/* <div className="w-full">
          <NumberField
            value={minPrice || undefined}
            onChange={(v) => setClientState({ minPrice: v || 0 })}
            minValue={0}
            formatOptions={{ style: "decimal", maximumFractionDigits: 2 }}
            className="flex-1"
          >
            <Label className="text-xs">Min Price ($)</Label>
            <NumberField.Group>
              <NumberField.DecrementButton />
              <NumberField.Input placeholder="0" />
              <NumberField.IncrementButton />
            </NumberField.Group>
          </NumberField>
        </div> */}
        {/* 
        <div className="w-full">
          <NumberField
            value={maxPrice || undefined}
            onChange={(v) => setClientState({ maxPrice: v || 0 })}
            minValue={0}
            formatOptions={{ style: "decimal", maximumFractionDigits: 2 }}
            className="flex-1"
          >
            <Label className="text-xs">Max Price ($)</Label>
            <NumberField.Group>
              <NumberField.DecrementButton />
              <NumberField.Input placeholder="Any" />
              <NumberField.IncrementButton />
            </NumberField.Group>
          </NumberField>
        </div> */}
        {/* <Button
          isDisabled={activeFiltersCount < 0}
          size="sm"
          onPress={resetAll}
        >
          Clear filters
        </Button> */}
      </div>

      {/* ── Categories ──────────────────────────────────────────────────── */}
      <div>
        {/* <Label className="text-default-500 mb-2 block text-xs font-semibold tracking-wide uppercase">
          Category
        </Label> */}
        {catsLoading ? (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-7 w-20 rounded-full" />
            ))}
          </div>
        ) : (
          <TagGroup
            aria-label="Categories"
            className="mb-4"
            selectionMode="single"
            selectedKeys={category ? new Set([category]) : new Set(["all"])}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0];
              startTransition(() => {
                setServerState({
                  category: selected === "all" ? "" : String(selected),
                  page: 1,
                });
              });
            }}
          >
            <TagGroup.List className="flex flex-wrap gap-1.5">
              <Tag id="all" textValue="All">
                All
              </Tag>
              {categories?.map((c) => (
                <Tag key={c.id} id={c.id} textValue={c.name}>
                  {c.name}
                </Tag>
              ))}
            </TagGroup.List>
          </TagGroup>
        )}
      </div>
    </div>
  );
};

export default ProductFilters;
