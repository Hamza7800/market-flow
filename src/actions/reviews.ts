"use server";

import { cacheDel } from "@/lib/cache-helpers";
import { orderKeys, reviewKeys } from "@/lib/cache-keys";
import { returnError } from "@/lib/utils";
import { getUser } from "@/server/better-auth/server";
import { db } from "@/server/db";
import { orderItems, products, reviews } from "@/server/db/schema";
import { reviewSchema, type ReviewSchema } from "@/zod-schema/review-schema";
import { and, eq, isNull, sql } from "drizzle-orm";

export const createReview = async (
  orderItemId: string,
  values: ReviewSchema,
) => {
  try {
    const user = await getUser();
    const validated = reviewSchema.parse(values);

    const item = await db.query.orderItems.findFirst({
      where: eq(orderItems.id, orderItemId),
      with: {
        order: {
          columns: { userId: true },
        },
      },
    });

    if (!item) {
      return {
        success: false,
        message: "Item not found",
        data: null,
      };
    }

    if (item.order.userId !== user.id) {
      return {
        success: false,
        message: "Access Denied",
        data: null,
      };
    }

    if (item.status !== "delivered") {
      return {
        success: false,
        message: "You can only review items that have been delivered",
        data: null,
      };
    }

    const existing = await db.query.reviews.findFirst({
      where: and(
        eq(reviews.orderItemId, orderItemId),
        isNull(reviews.deletedAt),
      ),
      columns: { id: true },
    });

    if (existing) {
      return {
        success: false,
        message: "You have already reviewed this item",
        data: null,
      };
    }

    const [review] = await db
      .insert(reviews)
      .values({
        productId: item.productId,
        userId: user.id,
        orderItemId,
        rating: validated.rating,
        title: validated.title || null,
        body: validated.body || null,
        status: "approved",
      })
      .returning();

    await syncProductRating(item.productId);

    cacheDel(
      reviewKeys.tags.byProduct(item.productId),
      reviewKeys.tags.byUser(user.id),
      orderKeys.tags.detail(item.orderId),
    );

    return {
      success: true,
      data: review,
      message: "Review submitted — thank you!",
    };
  } catch (error) {
    return returnError(error, "Unable to submit review");
  }
};

export const updateReview = async (reviewId: string, values: ReviewSchema) => {
  try {
    const user = await getUser();
    const validated = reviewSchema.parse(values);

    const review = await db.query.reviews.findFirst({
      where: and(
        eq(reviews.id, reviewId),
        eq(reviews.userId, user.id),
        isNull(reviews.deletedAt),
      ),
      columns: { id: true, productId: true },
    });

    if (!review)
      return {
        success: false,
        data: null,
        message: "Review not found or access denied",
      };

    const [updated] = await db
      .update(reviews)
      .set({
        rating: validated.rating,
        title: validated.title || null,
        body: validated.body || null,
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, reviewId))
      .returning();

    await syncProductRating(review.productId);

    cacheDel(
      reviewKeys.tags.byProduct(review.productId),
      reviewKeys.tags.byUser(user.id),
    );

    return {
      success: true,
      data: updated,
      message: "Review updated",
    };
  } catch (error) {
    return returnError(error, "Unable to update review");
  }
};

export async function deleteReview(reviewId: string) {
  try {
    const user = await getUser();

    const review = await db.query.reviews.findFirst({
      where: and(eq(reviews.id, reviewId), eq(reviews.userId, user.id)),
      columns: { id: true, productId: true },
    });

    if (!review)
      return {
        success: false,
        message: "Review not found or access denied",
        data: null,
      };

    // await db
    //   .update(reviews)
    //   .set({ deletedAt: new Date(), updatedAt: new Date() })
    //   .where(eq(reviews.id, reviewId));
    await db.delete(reviews).where(eq(reviews.id, reviewId));

    await syncProductRating(review.productId);

    cacheDel(
      reviewKeys.tags.byProduct(review.productId),
      reviewKeys.tags.byUser(user.id),
    );

    return {
      success: true,
      message: "Review deleted",
      data: { id: reviewId },
    };
  } catch (error) {
    return returnError(error, "Unable to delete review");
  }
}

export const syncProductRating = async (productId: string) => {
  const [result] = await db
    .select({
      avg: sql<string>`COALESCE(ROUND(AVG(${reviews.rating}::numeric), 2), 0)`,
      count: sql<string>`COUNT(*)`,
    })
    .from(reviews)
    .where(
      and(
        eq(reviews.productId, productId),
        eq(reviews.status, "approved"),
        isNull(reviews.deletedAt),
      ),
    );

  await db
    .update(products)
    .set({
      averageRating: result?.avg,
      reviewCount: Number(result?.count),
      updatedAt: new Date(),
    })
    .where(eq(products.id, productId));
};

export const getProductReviews = async (productId: string) => {
  try {
    const data = await db.query.reviews.findMany({
      where: and(
        eq(reviews.productId, productId),
        eq(reviews.status, "approved"),
        isNull(reviews.deletedAt),
      ),
      orderBy: (r, { desc }) => [desc(r.createdAt)],
      with: {
        user: { columns: { name: true, image: true } },
      },
      columns: {
        id: true,
        rating: true,
        title: true,
        body: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
      },
    });
    return {
      success: true,
      message: "Product Reviews",
      data,
    };
  } catch (error) {
    return returnError(error, "Unable to fetch reviews");
  }
};

export type ProductReview = NonNullable<
  Awaited<ReturnType<typeof getProductReviews>>["data"]
>[number];

export async function getUserReviewForOrderItem(orderItemId: string) {
  try {
    const user = await getUser();

    const review = await db.query.reviews.findFirst({
      where: and(
        eq(reviews.orderItemId, orderItemId),
        eq(reviews.userId, user.id),
        isNull(reviews.deletedAt),
      ),
      columns: {
        id: true,
        rating: true,
        title: true,
        body: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log("Review", review);

    if (!review) {
      return {
        success: false,
        data: null,
        message: "No Review",
      };
    }

    return {
      success: true,
      data: review,
      message: "User Item Review",
    };
  } catch (error) {
    return returnError(error, "Unable to fetch review");
  }
}
