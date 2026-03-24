"use client";

import { useTags } from "@/hooks/use-taxonomy";
import { ErrorMessage, Label, Tag, TagGroup } from "@heroui/react";
import { useMemo } from "react";

type Props = {
  value: string[] | undefined;
  onChange: (value: string[]) => void;
  error?: string;
};

const TagSelect = ({ value = [], onChange, error }: Props) => {
  const { data: tags } = useTags();

  const selectedKeys = useMemo(() => new Set(value), [value]);

  return (
    <TagGroup
      selectionMode="multiple"
      selectedKeys={selectedKeys}
      onSelectionChange={(keys) => {
        const arr = Array.from(keys as Set<string>);
        onChange(arr);
      }}
    >
      <Label>Tags</Label>

      <TagGroup.List className="flex flex-wrap gap-1.5">
        {tags?.map((tag) => (
          <Tag key={tag.id} id={tag.id}>
            {tag.name}
          </Tag>
        ))}
      </TagGroup.List>
      <ErrorMessage>{error && <>{error}</>}</ErrorMessage>
    </TagGroup>
  );
};

export default TagSelect;
