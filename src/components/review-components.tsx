"use client";

import {
  Alert,
  Avatar,
  Button,
  Input,
  Skeleton,
  TextArea,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDistanceToNow } from "date-fns";
import {
  PencilIcon,
  StarIcon,
  Trash2Icon,
  MessageSquarePlus,
} from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  useCreateReview,
  useDeleteReview,
  useUpdateReview,
  useUserReviewForOrderItem,
} from "@/hooks/use-reviews";
import { reviewSchema, type ReviewSchema } from "@/zod-schema/review-schema";

// ---------------------------------------------------------------------------
// StarRating
// ---------------------------------------------------------------------------
export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = "md",
}: {
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;
  const sizeClass = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-7 w-7" }[size];

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          className={`transition-transform ${
            readOnly
              ? "cursor-default"
              : "cursor-pointer hover:scale-110 active:scale-95"
          }`}
          aria-label={`${star} star${star !== 1 ? "s" : ""}`}
        >
          <StarIcon
            className={[
              sizeClass,
              "transition-all duration-200",
              star <= active
                ? "fill-warning text-warning drop-shadow-sm"
                : "text-default-200 fill-default-50",
            ].join(" ")}
          />
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ReviewForm
// ---------------------------------------------------------------------------
function ReviewForm({
  defaultValues,
  onSubmit,
  isLoading,
  onCancel,
  submitLabel = "Submit review",
}: {
  defaultValues?: Partial<ReviewSchema>;
  onSubmit: (values: ReviewSchema) => Promise<void>;
  isLoading: boolean;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewSchema>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: defaultValues?.rating ?? 0,
      title: defaultValues?.title ?? "",
      body: defaultValues?.body ?? "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="animate-in fade-in slide-in-from-top-2 space-y-5 duration-300"
    >
      <div className="flex flex-col gap-1.5">
        <label className="text-default-700 text-sm font-medium">
          Overall Rating <span className="text-danger">*</span>
        </label>
        <Controller
          control={control}
          name="rating"
          render={({ field }) => (
            <div className="bg-default-50 border-divider w-fit rounded-xl border p-3">
              <StarRating
                value={field.value}
                onChange={field.onChange}
                size="lg"
              />
            </div>
          )}
        />
        {errors.rating && (
          <p className="text-danger mt-1 text-xs">{errors.rating.message}</p>
        )}
      </div>

      <Input
        {...register("title")}
        // label="Headline"
        placeholder="What's most important to know?"
        // variant="faded"
        // isInvalid={!!errors.title}
        // errorMessage={errors.title?.message}
        // labelPlacement="outside"
      />

      <TextArea
        {...register("body")}
        // label="Written Review"
        placeholder="What did you like or dislike? What did you use this product for?"
        // variant="faded"
        // minRows={4}
        // isInvalid={!!errors.body}
        // errorMessage={errors.body?.message}
        // labelPlacement="outside"
      />

      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          // color="primary"
          // isLoading={isLoading}
          className="font-medium"
        >
          {submitLabel}
        </Button>
        {onCancel && (
          <Button
            type="button"
            // variant="light"
            onPress={onCancel}
            isDisabled={isLoading}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// OrderItemReview (The CTA in the order list)
// ---------------------------------------------------------------------------
export function OrderItemReview({
  orderItemId,
  productId,
  productName,
  orderId,
}: {
  orderItemId: string;
  productId: string;
  productName: string;
  orderId: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const { data: existing, isLoading } = useUserReviewForOrderItem(orderItemId);

  const create = useCreateReview(productId, orderId);
  const update = useUpdateReview(productId, orderItemId);
  const remove = useDeleteReview(productId, orderItemId);
  const [editing, setEditing] = useState(false);

  if (isLoading) return <Skeleton className="mt-3 h-10 w-32 rounded-lg" />;

  // ── Existing Review View ──
  if (existing && !editing) {
    return (
      <div className="bg-default-50 border-divider hover:border-default-300 mt-4 rounded-2xl border p-4 transition-all">
        <div className="mb-2 flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-default-500 text-xs font-semibold tracking-wider uppercase">
              Your Review
            </span>
            <StarRating value={existing.rating} readOnly size="sm" />
          </div>
          <div className="bg-background border-divider flex gap-1 rounded-lg border p-0.5 shadow-sm">
            <Button
              isIconOnly
              // variant="light"
              size="sm"
              onPress={() => setEditing(true)}
            >
              <PencilIcon className="text-default-500 hover:text-primary h-4 w-4 transition-colors" />
            </Button>
            <Button
              isIconOnly
              // variant="light"
              size="sm"
              onPress={() => remove.mutateAsync(existing.id)}
            >
              <Trash2Icon className="text-default-500 hover:text-danger h-4 w-4 transition-colors" />
            </Button>
          </div>
        </div>
        {existing.title && (
          <h4 className="mt-2 text-sm font-medium">{existing.title}</h4>
        )}
        {existing.body && (
          <p className="text-default-600 mt-1 text-sm leading-relaxed">
            {existing.body}
          </p>
        )}
      </div>
    );
  }

  // ── Edit Mode ──
  if (existing && editing) {
    return (
      <div className="border-primary/20 bg-primary/5 mt-4 rounded-2xl border p-5">
        <h4 className="text-primary mb-4 flex items-center gap-2 text-sm font-semibold">
          <PencilIcon className="h-4 w-4" /> Edit Your Review
        </h4>
        <ReviewForm
          defaultValues={{
            rating: existing.rating,
            title: existing.title ?? "",
            body: existing.body ?? "",
          }}
          isLoading={update.isPending}
          onCancel={() => setEditing(false)}
          submitLabel="Save Changes"
          onSubmit={async (values) => {
            const result = await update.mutateAsync({
              reviewId: existing.id,
              values,
            });
            if (result.success) setEditing(false);
          }}
        />
      </div>
    );
  }

  // ── Create Mode ──
  if (showForm) {
    return (
      <div className="border-divider bg-background mt-4 rounded-2xl border p-5 shadow-sm">
        <h4 className="text-default-700 mb-4 flex items-center gap-2 text-sm font-semibold">
          <MessageSquarePlus className="text-primary h-4 w-4" /> Review{" "}
          {productName}
        </h4>
        <ReviewForm
          isLoading={create.isPending}
          onCancel={() => setShowForm(false)}
          onSubmit={async (values) => {
            const result = await create.mutateAsync({ orderItemId, values });
            if (result.success) setShowForm(false);
          }}
        />
        {create.data?.success === false && (
          <Alert color="danger" className="mt-3">
            {create.data.message}
          </Alert>
        )}
      </div>
    );
  }

  // ── Initial CTA ──
  return (
    <div className="mt-3">
      <Button
        size="sm"
        // variant="flat"
        // color="primary"
        className="px-4 font-medium"
        // startContent={<StarIcon className="h-4 w-4" />}
        onPress={() => setShowForm(true)}
      >
        Write a review
      </Button>
    </div>
  );
}

// "use client";

// /**
//  * Four components:
//  *
//  * StarRating        — interactive 1-5 star picker (or read-only display)
//  * ReviewForm        — create / edit form with RHF
//  * ReviewCard        — single review display with edit/delete for owner
//  * OrderItemReview   — the full CTA that lives on the order detail page
//  *                     per delivered item — shows form if not yet reviewed,
//  *                     shows the existing review with edit/delete if already done
//  */

// import {
//   Alert,
//   Avatar,
//   Button,
//   FieldError,
//   Input,
//   Label,
//   Modal,
//   Separator,
//   Skeleton,
//   TextArea,
//   TextField,
// } from "@heroui/react";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { formatDistanceToNow } from "date-fns";
// import { PencilIcon, StarIcon, Trash2Icon } from "lucide-react";
// import { useState } from "react";
// import { Controller, useForm } from "react-hook-form";
// import {
//   useCreateReview,
//   useDeleteReview,
//   useUpdateReview,
//   useUserReviewForOrderItem,
// } from "@/hooks/use-reviews";
// import { reviewSchema, type ReviewSchema } from "@/zod-schema/review-schema";

// // ---------------------------------------------------------------------------
// // StarRating
// // ---------------------------------------------------------------------------

// export function StarRating({
//   value,
//   onChange,
//   readOnly = false,
//   size = "md",
// }: {
//   value: number;
//   onChange?: (v: number) => void;
//   readOnly?: boolean;
//   size?: "sm" | "md" | "lg";
// }) {
//   const [hovered, setHovered] = useState(0);
//   const active = hovered || value;
//   const sizeClass = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" }[size];

//   return (
//     <div className="flex items-center gap-0.5">
//       {[1, 2, 3, 4, 5].map((star) => (
//         <button
//           key={star}
//           type="button"
//           disabled={readOnly}
//           onClick={() => onChange?.(star)}
//           onMouseEnter={() => !readOnly && setHovered(star)}
//           onMouseLeave={() => !readOnly && setHovered(0)}
//           className={readOnly ? "cursor-default" : "cursor-pointer"}
//           aria-label={`${star} star${star !== 1 ? "s" : ""}`}
//         >
//           <StarIcon
//             className={[
//               sizeClass,
//               "transition-colors",
//               star <= active
//                 ? "fill-warning text-warning"
//                 : "text-default-300 fill-none",
//             ].join(" ")}
//           />
//         </button>
//       ))}
//     </div>
//   );
// }

// // ---------------------------------------------------------------------------
// // ReviewForm  (used for both create and edit)
// // ---------------------------------------------------------------------------

// function ReviewForm({
//   defaultValues,
//   onSubmit,
//   isLoading,
//   onCancel,
//   submitLabel = "Submit review",
// }: {
//   defaultValues?: Partial<ReviewSchema>;
//   onSubmit: (values: ReviewSchema) => Promise<void>;
//   isLoading: boolean;
//   onCancel?: () => void;
//   submitLabel?: string;
// }) {
//   const {
//     register,
//     control,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<ReviewSchema>({
//     resolver: zodResolver(reviewSchema),
//     defaultValues: {
//       rating: defaultValues?.rating ?? 0,
//       title: defaultValues?.title ?? "",
//       body: defaultValues?.body ?? "",
//     },
//   });

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//       {/* Star picker */}
//       <div>
//         <Label className="mb-1.5 block text-sm font-medium">
//           Rating <span className="text-danger">*</span>
//         </Label>
//         <Controller
//           control={control}
//           name="rating"
//           render={({ field }) => (
//             <StarRating value={field.value} onChange={field.onChange} />
//           )}
//         />
//         {errors.rating && (
//           <p className="text-danger mt-1 text-xs">{errors.rating.message}</p>
//         )}
//       </div>

//       {/* Title */}
//       <TextField isInvalid={!!errors.title} className="w-full">
//         <Label>
//           Title <span className="text-default-400 text-xs">(optional)</span>
//         </Label>
//         <Input {...register("title")} placeholder="Summarise your experience" />
//         <FieldError>{errors.title?.message}</FieldError>
//       </TextField>

//       {/* Body */}
//       <TextField isInvalid={!!errors.body} className="w-full">
//         <Label>
//           Review <span className="text-default-400 text-xs">(optional)</span>
//         </Label>
//         <TextArea
//           {...register("body")}
//           placeholder="What did you think of this product?"
//           className="min-h-[100px] resize-y"
//         />
//         <FieldError>{errors.body?.message}</FieldError>
//       </TextField>

//       <div className="flex gap-2">
//         <Button
//           type="submit"
//           // color="primary"
//           size="sm"
//           // isLoading={isLoading}
//           isDisabled={isLoading}
//         >
//           {submitLabel}
//         </Button>
//         {onCancel && (
//           <Button
//             type="button"
//             // variant="light"
//             size="sm"
//             onPress={onCancel}
//             isDisabled={isLoading}
//           >
//             Cancel
//           </Button>
//         )}
//       </div>
//     </form>
//   );
// }

// // ---------------------------------------------------------------------------
// // ReviewCard  — single review, with edit/delete for the owner
// // ---------------------------------------------------------------------------

// export function ReviewCard({
//   review,
//   currentUserId,
//   productId,
//   orderItemId,
// }: {
//   review: {
//     id: string;
//     rating: number;
//     title: string | null;
//     body: string | null;
//     createdAt: Date;
//     updatedAt: Date | null;
//     userId: string;
//     user: { name: string; image: string | null };
//   };
//   currentUserId?: string;
//   productId: string;
//   orderItemId?: string;
// }) {
//   const [editing, setEditing] = useState(false);
//   const isOwner = currentUserId === review.userId;

//   const update = useUpdateReview(productId, orderItemId ?? "");
//   const remove = useDeleteReview(productId, orderItemId ?? "");

//   if (editing) {
//     return (
//       <div className="border-primary/30 bg-primary/5 rounded-xl border p-4">
//         <p className="mb-3 text-sm font-medium">Edit your review</p>
//         <ReviewForm
//           defaultValues={{
//             rating: review.rating,
//             title: review.title ?? "",
//             body: review.body ?? "",
//           }}
//           isLoading={update.isPending}
//           onCancel={() => setEditing(false)}
//           submitLabel="Save changes"
//           onSubmit={async (values) => {
//             const result = await update.mutateAsync({
//               reviewId: review.id,
//               values,
//             });
//             if (result.success) setEditing(false);
//           }}
//         />
//         {update.data?.success === false && (
//           <Alert color="danger" className="mt-2">
//             {update.data.message}
//           </Alert>
//         )}
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col gap-2">
//       <div className="flex items-start justify-between gap-3">
//         <div className="flex items-center gap-2.5">
//           <Avatar
//           // src={review.user.image ?? undefined}
//           // name={review.user.name}
//           // size="sm"
//           />
//           <div>
//             <p className="text-sm font-medium">{review.user.name}</p>
//             <p className="text-default-400 text-xs">
//               {formatDistanceToNow(new Date(review.createdAt), {
//                 addSuffix: true,
//               })}
//               {review.updatedAt &&
//                 review.updatedAt !== review.createdAt &&
//                 " (edited)"}
//             </p>
//           </div>
//         </div>

//         <div className="flex items-center gap-1.5">
//           <StarRating value={review.rating} readOnly size="sm" />
//           {isOwner && (
//             <>
//               <Button
//                 isIconOnly
//                 // variant="light"
//                 size="sm"
//                 className="text-default-400 hover:text-primary h-7 w-7"
//                 onPress={() => setEditing(true)}
//                 aria-label="Edit review"
//               >
//                 <PencilIcon className="h-3.5 w-3.5" />
//               </Button>
//               <Button
//                 isIconOnly
//                 // variant="light"
//                 size="sm"
//                 className="text-default-400 hover:text-danger h-7 w-7"
//                 // isLoading={remove.isPending}
//                 onPress={() => remove.mutate(review.id)}
//                 aria-label="Delete review"
//               >
//                 <Trash2Icon className="h-3.5 w-3.5" />
//               </Button>
//             </>
//           )}
//         </div>
//       </div>

//       {review.title && <p className="text-sm font-semibold">{review.title}</p>}
//       {review.body && (
//         <p className="text-default-600 text-sm leading-relaxed">
//           {review.body}
//         </p>
//       )}
//     </div>
//   );
// }

// // ---------------------------------------------------------------------------
// // OrderItemReview  — CTA on the order detail page per delivered item
// //
// // Shows:
// //   - "Write a review" form if not yet reviewed
// //   - The existing review with edit/delete if already done
// // ---------------------------------------------------------------------------

// export function OrderItemReview({
//   orderItemId,
//   productId,
//   productName,
//   orderId,
//   // userId,
// }: {
//   orderItemId: string;
//   productId: string;
//   productName: string;
//   orderId: string;
//   // userId: string;
// }) {
//   const [showForm, setShowForm] = useState(false);

//   const { data: existing, isLoading } = useUserReviewForOrderItem(
//     orderItemId,
//     // userId,
//   );

//   const create = useCreateReview(productId, orderId);
//   const update = useUpdateReview(productId, orderItemId);
//   const remove = useDeleteReview(productId, orderItemId);
//   const [editing, setEditing] = useState(false);

//   if (isLoading) {
//     return <Skeleton className="h-8 w-28 rounded-lg" />;
//   }

//   console.log(existing);

//   // ── Already reviewed ──────────────────────────────────────────────────────
//   if (existing && !editing) {
//     return (
//       <div className="border-divider bg-default-50 mt-3 rounded-xl border p-3">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <StarRating value={existing.rating} readOnly size="sm" />
//             <span className="text-default-400 text-xs">Your review</span>
//           </div>
//           <div className="flex gap-1">
//             <Button
//               isIconOnly
//               // variant="light"
//               size="sm"
//               className="h-7 w-7"
//               onPress={() => setEditing(true)}
//               aria-label="Edit review"
//             >
//               <PencilIcon className="h-3.5 w-3.5" />
//             </Button>
//             <Button
//               isIconOnly
//               // variant="light"
//               size="sm"
//               // color="danger"
//               className="h-7 w-7"
//               // isLoading={remove.isPending}
//               onPress={async () => {
//                 await remove.mutateAsync(existing.id);
//               }}
//               aria-label="Delete review"
//             >
//               <Trash2Icon className="h-3.5 w-3.5" />
//             </Button>
//           </div>
//         </div>
//         {existing.title && (
//           <p className="mt-1.5 text-xs font-medium">{existing.title}</p>
//         )}
//         {existing.body && (
//           <p className="text-default-500 mt-0.5 line-clamp-2 text-xs">
//             {existing.body}
//           </p>
//         )}
//       </div>
//     );
//   }

//   // ── Edit mode ─────────────────────────────────────────────────────────────
//   if (existing && editing) {
//     return (
//       <div className="border-primary/30 bg-primary/5 mt-3 rounded-xl border p-3">
//         <p className="text-primary mb-3 text-xs font-semibold tracking-wide uppercase">
//           Edit review
//         </p>
//         <ReviewForm
//           defaultValues={{
//             rating: existing.rating,
//             title: existing.title ?? "",
//             body: existing.body ?? "",
//           }}
//           isLoading={update.isPending}
//           onCancel={() => setEditing(false)}
//           submitLabel="Save"
//           onSubmit={async (values) => {
//             const result = await update.mutateAsync({
//               reviewId: existing.id,
//               values,
//             });
//             if (result.success) setEditing(false);
//           }}
//         />
//       </div>
//     );
//   }

//   // ── Write a review ────────────────────────────────────────────────────────
//   if (showForm) {
//     return (
//       <div className="border-divider mt-3 rounded-xl border p-3">
//         <p className="text-default-500 mb-3 text-xs font-semibold tracking-wide uppercase">
//           Review: {productName}
//         </p>
//         <ReviewForm
//           isLoading={create.isPending}
//           onCancel={() => setShowForm(false)}
//           onSubmit={async (values) => {
//             const result = await create.mutateAsync({ orderItemId, values });
//             if (result.success) setShowForm(false);
//           }}
//         />
//         {create.data?.success === false && (
//           <Alert color="danger" className="mt-2">
//             {create.data.message}
//           </Alert>
//         )}
//       </div>
//     );
//   }

//   return (
//     <Button
//       size="sm"
//       // variant="flat"
//       // color="primary"
//       className="mt-2"
//       // startContent={<StarIcon className="h-3.5 w-3.5" />}
//       onPress={() => setShowForm(true)}
//     >
//       Write a review
//     </Button>
//   );
// }
