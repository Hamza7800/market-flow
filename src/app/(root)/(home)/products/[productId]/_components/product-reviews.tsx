"use client";

import type { ProductDetail } from "@/actions/public";
import { EmptyState } from "@/components/empty-state";
import { Avatar } from "@heroui/react";
import { Star } from "lucide-react";
import { useMemo } from "react";

// interface Review {
//   id: string;
//   rating: number;
//   title: string;
//   comment: string;
//   authorName: string;
//   authorInitials?: string;
//   createdAt?: string;
//   verified?: boolean;
// }

interface ProductReviewsProps {
  reviews: ProductDetail["reviews"];
  averageRating?: ProductDetail["averageRating"];
  reviewCount?: ProductDetail["reviewCount"];
}

const ProductReviews = ({
  reviews,
  averageRating,
  reviewCount,
}: ProductReviewsProps) => {
  const rating = Number(averageRating ?? 0);
  const totalReviews = reviewCount ?? 0;

  const ratingCounts = useMemo(() => {
    return [5, 4, 3, 2, 1].map((star) => {
      const count = reviews.filter((r) => r.rating === star).length;
      const percentage = totalReviews
        ? Math.round((count / totalReviews) * 100)
        : 0;

      return { star, count, percentage };
    });
  }, [reviews, totalReviews]);

  if (!reviews || reviews.length === 0) {
    return (
      <EmptyState
        icon={Star}
        title="No Reviews"
        description="No reviews yet. Be the first to review!"
      />
    );
  }

  const getRatingColor = (rate: number) => {
    if (rate >= 4) return "text-emerald-600";
    if (rate >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="h-screen space-y-6">
      {/* RATING SUMMARY */}
      <div className="bg-surface border-border rounded-lg border p-6">
        <h3 className="text-foreground mb-4 text-lg font-semibold">
          Customer Reviews
        </h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* RATING OVERVIEW */}
          <div className="flex flex-col items-start">
            <div className="mb-4 flex items-baseline gap-2">
              <span className="text-foreground text-4xl font-bold">
                {rating}
              </span>
              <span className="text-muted">/ 5.0</span>
            </div>
            <div className="mb-2 flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={`${
                    i < Math.floor(rating)
                      ? "fill-accent text-accent"
                      : "text-border"
                  }`}
                />
              ))}
            </div>
            <p className="text-muted text-sm">{totalReviews} reviews</p>
          </div>

          {/* RATING DISTRIBUTION */}
          <div className="space-y-2">
            {ratingCounts.map(({ star, percentage }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-muted w-12 text-sm">{star} star</span>

                <div className="bg-border h-2 flex-1 overflow-hidden rounded-full">
                  <div
                    className="bg-accent h-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <span className="text-muted w-8 text-right text-sm">
                  {percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* INDIVIDUAL REVIEWS */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-surface border-border rounded-lg border p-5"
          >
            {/* HEADER */}
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <Avatar.Fallback className="text-accent bg-white/10 font-semibold">
                    {review.user.name ||
                      review.user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                  </Avatar.Fallback>
                </Avatar>
                <div>
                  <p className="text-foreground font-medium">
                    {review.user.name}
                  </p>
                  {review.createdAt && (
                    <p className="text-muted text-xs">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* RATING AND TITLE */}
            <div className="mb-2">
              <div className="mb-2 flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={`${
                      i < review.rating
                        ? "fill-accent text-accent"
                        : "text-border"
                    }`}
                  />
                ))}
              </div>
              <h4 className="text-foreground font-semibold">{review.title}</h4>
            </div>

            {/* COMMENT */}
            <p className="text-muted text-sm leading-relaxed">{review.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductReviews;
