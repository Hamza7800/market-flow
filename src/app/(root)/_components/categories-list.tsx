"use client";
import { useCategories } from "@/hooks/use-public";
import { Card } from "@heroui/react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import HomeCategoriesLoading from "@/components/loading-skeletons/home-categories-loading";

const categoryColors = [
  { bg: "bg-surface", text: "text-foreground", border: "border-border" },
  { bg: "bg-surface", text: "text-foreground", border: "border-border" },
  { bg: "bg-surface", text: "text-foreground", border: "border-border" },
  { bg: "bg-surface", text: "text-foreground", border: "border-border" },
  { bg: "bg-surface", text: "text-foreground", border: "border-border" },
  { bg: "bg-surface", text: "text-foreground", border: "border-border" },
];

const CategoriesList = () => {
  const { data: categories, isPending } = useCategories();

  if (isPending) {
    return <HomeCategoriesLoading />;
  }

  if (!categories?.length) return null;

  return (
    <section className="py-10">
      <div className="mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h2 className="text-foreground mb-3 text-3xl font-bold md:text-4xl">
            Explore Categories
          </h2>
          <p className="text-muted-foreground text-lg">
            Discover our curated selection of premium products across all
            categories
          </p>
        </div>

        {/* CATEGORIES GRID */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories?.slice(0, 5).map((category, index) => {
            const color = categoryColors[index % categoryColors.length];

            return (
              <Link
                key={category.id}
                href={`/products?category=${category.id}`}
                className="group"
              >
                <Card
                  className={`hover:border-accent flex h-32 cursor-pointer flex-col justify-between rounded-lg border border-black/20 p-4 shadow-sm transition-all duration-300 hover:shadow-md`}
                >
                  {/* CONTENT */}
                  <div>
                    <h3 className={`line-clamp-2 text-sm font-semibold`}>
                      {category.name}
                    </h3>
                  </div>

                  {/* ARROW */}
                  <div
                    className={`flex items-center gap-1 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100`}
                  >
                    <span>Explore</span>
                    <ChevronRight size={14} />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* VIEW ALL LINK */}
        {categories?.length > 6 && (
          <div className="mt-8 text-center">
            <Link
              href="/browse"
              className="text-primary inline-flex items-center gap-2 font-semibold transition-all hover:gap-3"
            >
              View All Categories
              <ChevronRight size={20} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoriesList;
