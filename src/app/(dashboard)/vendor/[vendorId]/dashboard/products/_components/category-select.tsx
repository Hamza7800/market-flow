import { useCategories } from "@/hooks/use-taxonomy";
import { Label, ListBox, Select } from "@heroui/react";

type Props = {
  value: string | undefined;
  onChange: (value: string) => void;
};

import { useMemo } from "react";
import type { Category } from "./product-form";

function buildCategoryTree(categories: Category[]) {
  const map = new Map<string, Category & { children: Category[] }>();

  categories.forEach((c) => {
    map.set(c.id, { ...c, children: [] });
  });

  const roots: (Category & { children: Category[] })[] = [];

  map.forEach((cat) => {
    if (cat.parentId) {
      const parent = map.get(cat.parentId);
      parent?.children.push(cat);
    } else {
      roots.push(cat);
    }
  });

  return roots;
}

function flattenTree(
  nodes: (Category & { children: Category[] })[],
  depth = 0,
): (Category & { depth: number })[] {
  return nodes.flatMap((node) => [
    { ...node, depth },
    // @ts-expect-error error
    ...flattenTree(node.children, depth + 1),
  ]);
}

const CategorySelect = ({ value, onChange }: Props) => {
  const { data: categories } = useCategories();

  const flatCategories = useMemo(() => {
    if (!categories) return [];

    const tree = buildCategoryTree(categories);
    return flattenTree(tree);
  }, [categories]);

  const current =
    flatCategories.find((c) => c.id === value) ?? flatCategories[0];

  return (
    <Select
      aria-label="category"
      className="w-auto"
      value={current?.id}
      onChange={(key) => {
        // const val = Array.from(key)[0] as string;
        onChange(key as string);
      }}
    >
      <Label>Category</Label>

      <Select.Trigger>
        <span className="ml-1">{current?.name}</span>
        <Select.Indicator />
      </Select.Trigger>

      <Select.Popover className="w-full max-w-[250px]">
        <ListBox className="mt-1 outline-none">
          {flatCategories.map((c) => (
            <ListBox.Item key={c.id} id={c.id}>
              <span
                style={{ paddingLeft: `${c.depth * 12}px` }}
                className="flex-1"
              >
                {/* {c.depth > 0 && ""} */}
                {c.name}
              </span>
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
};

export default CategorySelect;
