import {
  createProductDefaults,
  createProductSchema,
  productVariantSchema,
  type CreateProductSchema,
  type ProductImageSchema,
  type ProductVariantSchema,
  type UpdateProductSchema,
} from "@/zod-schema/product-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "nextjs-toploader/app";
import {
  useFieldArray,
  useForm,
  useWatch,
  type UseFieldArrayReturn,
  type UseFormReturn,
} from "react-hook-form";
import {
  useCreateProduct,
  useDeleteProduct,
  useUpdateProduct,
  useUpdateProductStatus,
} from "./use-product";

export const emptyVariant = (): ProductVariantSchema => ({
  name: "",
  options: { "": "" },
  price: undefined,
  stock: 0,
  sku: "",
  imageUrl: "",
});

export const emptyImage = (): ProductImageSchema => ({
  url: "",
  altText: "",
  sortOrder: 0,
  isPrimary: false,
});

type CreateMode = {
  mode: "create";
  vendorId: string;
  redirectTo?: string;
};

type EditMode = {
  mode: "edit";
  vendorId: string;
  productId: string;
  productSlug: string;
  currentStatus: "draft" | "active" | "archived";
  defaultValues: Partial<CreateProductSchema>;
  redirectTo?: string;
};

type UseProductFormProps = CreateMode | EditMode;

export type UseProductFormReturn = {
  form: UseFormReturn<CreateProductSchema>;
  variantFields: UseFieldArrayReturn<CreateProductSchema, "variants">["fields"];
  appendVariant: (v?: Partial<ProductVariantSchema>) => void;
  removeVariant: (index: number) => void;

  imageFields: UseFieldArrayReturn<CreateProductSchema, "images">["fields"];
  appendImage: (img?: Partial<ProductImageSchema>) => void;
  removeImage: (index: number) => void;
  setPrimaryImage: (index: number) => void;

  hasVariants: boolean;

  onSubmit: (values: CreateProductSchema) => Promise<void>;
  isSubmitting: boolean;
  serverError: string | null;

  onStatusChange?: (status: "draft" | "active" | "archived") => Promise<void>;
  isStatusChanging?: boolean;

  onDelete?: () => Promise<void>;
  isDeleting?: boolean;
};

export const useProductForm = (
  props: UseProductFormProps,
): UseProductFormReturn => {
  const router = useRouter();
  const isEdit = props.mode === "edit";

  const form = useForm<CreateProductSchema>({
    resolver: zodResolver(createProductSchema),
    defaultValues:
      props.mode === "edit" && props.defaultValues
        ? { ...createProductDefaults, ...props.defaultValues }
        : createProductDefaults,
    mode: "onTouched",
  });

  const hasVariants = useWatch({ control: form.control, name: "hasVariants" });

  const variantFieldArray = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const imageFieldArray = useFieldArray({
    control: form.control,
    name: "images",
  });

  const createMutation = useCreateProduct(props.vendorId);

  const updateMutation = isEdit
    ? useUpdateProduct(props.vendorId, props.productId)
    : null;

  const statusMutation = isEdit
    ? useUpdateProductStatus(
        props.vendorId,
        props.productId,
        props.currentStatus,
      )
    : null;

  const deleteMutation = isEdit
    ? useDeleteProduct(props.vendorId, props.productId, props.currentStatus)
    : null;

  const appendImage = (img?: Partial<ProductImageSchema>) => {
    imageFieldArray.append({ ...emptyImage(), ...img });
  };

  const removeImage = (index: number) => {
    imageFieldArray.remove(index);
    const images = form.getValues("images");
    if (images.length > 0 && !images.some((img) => img.isPrimary)) {
      form.setValue("images.0.isPrimary", true);
    }
  };

  const setPrimaryImage = (index: number) => {
    const images = form.getValues("images");
    images.forEach((_, i) => {
      form.setValue(`images.${i}.isPrimary`, i === index, {
        shouldDirty: true,
      });
    });
  };

  const appendVariant = (v?: Partial<ProductVariantSchema>) => {
    variantFieldArray.append({ ...emptyVariant(), ...v });
  };

  const removeVariant = (index: number) => {
    variantFieldArray.remove(index);
  };

  const onSubmit = async (values: CreateProductSchema) => {
    if (isEdit && updateMutation) {
      const result = await updateMutation.mutateAsync(
        values as UpdateProductSchema,
      );

      // if (result.success && props.redirectTo) {
      //   router.push(props.redirectTo);
      // }
    } else {
      const result = await createMutation.mutateAsync(values);

      // if (result.success) {
      //   form.reset(createProductDefaults);
      //   if (props.redirectTo) {
      //     router.push(props.redirectTo);
      //   }
      // }
    }
  };

  const onStatusChange =
    isEdit && statusMutation
      ? async (status: "draft" | "active" | "archived") => {
          await statusMutation.mutateAsync({ status });
        }
      : undefined;

  const onDelete =
    isEdit && deleteMutation
      ? async () => {
          const result = await deleteMutation.mutateAsync(props.productId);
          // if (result.success && props.redirectTo) {
          //   router.push(props.redirectTo);
          // }
        }
      : undefined;

  const isSubmitting =
    createMutation.isPending || (updateMutation?.isPending ?? false);

  // const serverError =
  //   createMutation.data?.success === false
  //     ? (createMutation.data.message ?? null)
  //     : updateMutation?.data?.success === false
  //       ? (updateMutation.data.message ?? null)
  //       : null;
  const serverError = null;

  return {
    form,

    variantFields: variantFieldArray.fields,
    appendVariant,
    removeVariant,

    imageFields: imageFieldArray.fields,
    appendImage,
    removeImage,
    setPrimaryImage,

    hasVariants,

    onSubmit,
    isSubmitting,
    serverError,

    onStatusChange,
    isStatusChanging: statusMutation?.isPending,

    onDelete,
    isDeleting: deleteMutation?.isPending,
  };
};
