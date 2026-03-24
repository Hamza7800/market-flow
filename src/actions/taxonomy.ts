"use server";

import { cacheWrap } from "@/lib/cache-helpers";
import { categoryKeys } from "@/lib/cache-keys";
import { returnError } from "@/lib/utils";
import { db } from "@/server/db";
import { categories, tags } from "@/server/db/schema";

export const getTags = async () => {
  try {
    const tagsResult = await db.select().from(tags);
    return {
      success: true,
      message: "Tags",
      data: tagsResult,
    };
  } catch (error) {
    return returnError(error, "Unable to fetch tags");
  }
};

export const getCategories = async () => {
  try {
    const categoriesResult = await cacheWrap(
      categoryKeys.tags.all(),
      [categoryKeys.tags.all()],
      async () => await db.select().from(categories),
    );
    return {
      success: true,
      message: "Categories",
      data: categoriesResult,
    };
  } catch (error) {
    return returnError(error, "Unable to fetch categories");
  }
};
