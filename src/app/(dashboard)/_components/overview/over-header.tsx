"use client";
import { getMonthOptions, monthLabel, type MonthFilter } from "@/lib/utils";
import { useRouter } from "nextjs-toploader/app";
import { Label, ListBox, Select } from "@heroui/react";
import { LinkButton } from "@/components/link-button";

export const OverviewHeader = ({
  vendorId,
  filter,
}: {
  vendorId: string;
  filter: MonthFilter;
}) => {
  const router = useRouter();
  const options = getMonthOptions(13);
  const currentKey = filter ? `${filter.year}-${filter.month}` : "all";

  const handleSelect = (key: string) => {
    if (key === "all") {
      router.push("?");
    } else {
      const [year, month] = key.split("-");
      router.push(`?year=${year}&month=${month}`);
    }
  };

  return (
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-foreground text-[22px] font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-default-400 mt-0.5 text-sm">
          {filter ? monthLabel(filter) : "All time overview"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* Month picker */}
        <Select
          value={currentKey}
          onChange={(k) => handleSelect(String(k))}
          className="w-36"
          aria-label="Select month"
        >
          <Select.Trigger className="border-border rounded-xl border px-3 py-3 text-sm shadow-none">
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox className="w-[200px]">
              <ListBox.Item key="all" id="all" textValue="All time">
                <Label>All time</Label>
              </ListBox.Item>
              {options.map((opt) => {
                const key = `${opt!.year}-${opt!.month}`;
                return (
                  <ListBox.Item key={key} id={key} textValue={monthLabel(opt)}>
                    <Label>{monthLabel(opt)}</Label>
                  </ListBox.Item>
                );
              })}
            </ListBox>
          </Select.Popover>
        </Select>

        <LinkButton
          href={`/vendor/${vendorId}/dashboard/products/form`}
          size="sm"
        >
          New Product
        </LinkButton>
      </div>
    </div>
  );
};
