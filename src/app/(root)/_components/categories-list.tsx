"use client";
import { useCategories } from "@/hooks/use-public";
import { browseServerParams } from "@/lib/nuqs/public";
import { Tag, TagGroup } from "@heroui/react";
import { useQueryStates } from "nuqs";

const CategoriesList = () => {
  const { data, isLoading } = useCategories();
  const [{ category, page }, setServerState] = useQueryStates(
    browseServerParams,
    {
      history: "push",
      shallow: false,
    },
  );

  return (
    <div>
      <TagGroup aria-label="Categories" selectionMode="single">
        <TagGroup.List>
          <Tag
            id="all"
            textValue="All"
            onClick={() => {
              setServerState({ category: "" });
            }}
          >
            All
          </Tag>
          {data?.map((c) => (
            <Tag
              key={c.id}
              id={c.id}
              onClick={() => {
                setServerState({
                  category: c.id,
                });
              }}
              textValue={c.name}
            >
              {c.name}
            </Tag>
          ))}
        </TagGroup.List>
      </TagGroup>
    </div>
  );
};

export default CategoriesList;
