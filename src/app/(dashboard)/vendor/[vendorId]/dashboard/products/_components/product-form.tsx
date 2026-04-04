"use client";
import {
  createProductDefaults,
  createProductSchema,
  type CreateProductSchema,
  type UpdateProductSchema,
} from "@/zod-schema/product-schema";
import {
  Alert,
  Button,
  Card,
  Chip,
  Description,
  FieldError,
  Form,
  Input,
  Label,
  ListBox,
  NumberField,
  Select,
  Separator,
  Spinner,
  Surface,
  Switch,
  Tabs,
  Tag,
  // Tag,
  TagGroup,
  TextArea,
  TextField,
} from "@heroui/react";
import {
  ArchiveIcon,
  ArrowLeft,
  CheckCircleIcon,
  ClockIcon,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { VariantBuilder } from "./variant-builder";
import { useRouter } from "nextjs-toploader/app";
import { zodResolver } from "@hookform/resolvers/zod";
import CategorySelect from "@/app/(dashboard)/vendor/[vendorId]/dashboard/products/_components/category-select";
import TagSelect from "@/app/(dashboard)/vendor/[vendorId]/dashboard/products/_components/tags-select";
import {
  useCreateProduct,
  useUpdateProduct,
  useUpdateProductStatus,
} from "@/hooks/use-product";
import { MultiImageUploader } from "@/components/image-upload";
import DeleteProduct from "./delete-product";

export type Category = { id: string; name: string; parentId?: string | null };

type CreateProps = {
  mode: "create";
  vendorId: string;
  // category: string;
  // availableTags: TagType[];
  redirectTo?: string;
};

type EditProps = {
  mode: "edit";
  vendorId: string;
  productId: string;
  currentStatus: "draft" | "active" | "archived";
  defaultValues: Partial<CreateProductSchema>;
  // category: string;
  // availableTags: TagType[];
  redirectTo?: string;
};

const STATUS_CONFIG = {
  draft: {
    label: "Draft",
    icon: ClockIcon,
    color: "secondary" as const,
  },
  active: {
    label: "Active",
    icon: CheckCircleIcon,
    color: "success" as const,
  },
  archived: {
    label: "Archived",
    icon: ArchiveIcon,
    color: "default" as const,
  },
} as const;

type Props = CreateProps | EditProps;

const ProductForm = (props: Props) => {
  const router = useRouter();
  const isEdit = props.mode === "edit";
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

  const form = useForm<CreateProductSchema>({
    resolver: zodResolver(createProductSchema),
    defaultValues:
      props.mode === "edit" && props.defaultValues
        ? { ...createProductDefaults, ...props.defaultValues }
        : createProductDefaults,
    // mode: "onTouched",
  });

  const { control, handleSubmit, setValue, watch } = form;
  const hasVariants = watch("hasVariants");

  const onSubmit = async (values: CreateProductSchema) => {
    if (isEdit && updateMutation) {
      const result = await updateMutation.mutateAsync(
        values as unknown as UpdateProductSchema,
      );
      // if (result.success && props.redirectTo) {
      //   router.push(props.redirectTo);
      // }
    } else {
      const result = await createMutation.mutateAsync(values);
      if (result.success) {
        form.reset(createProductDefaults);
        // if (props.redirectTo) {
        router.back();
        // }
      }
    }
  };

  const onStatusChange =
    isEdit && statusMutation
      ? async (status: "draft" | "active" | "archived") => {
          await statusMutation.mutateAsync({ status });
        }
      : undefined;

  // const onDelete =
  //   isEdit && deleteMutation
  //     ? async () => {
  //         const result = await deleteMutation.mutateAsync(props.productId);
  //         if (result.success) {
  //           router.back();
  //         }
  //       }
  //     : undefined;

  const isSubmitting =
    createMutation.isPending ||
    (updateMutation?.isPending ?? false) ||
    statusMutation?.isPending ||
    false;

  const currentStatus = isEdit ? props.currentStatus : "draft";
  const statusCfg = STATUS_CONFIG[currentStatus];

  // const serverError =
  // createMutation.data?.success === false
  //   ? (createMutation.data.message ?? null)
  //   : updateMutation?.data?.success === false
  //   ? (updateMutation.data.message ?? null)
  //     : null;

  return (
    <div className="pb-24">
      <div className="flex flex-col gap-3">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft />
          Back
        </Button>
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            {isEdit ? "Edit product" : "New product"}
          </h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {isEdit
              ? "Changes are saved immediately. Drafts are never shown to customers."
              : "Products start as drafts. Publish when ready."}
          </p>
        </div>
      </div>
      <Surface className="flex items-center justify-between p-4">
        {isEdit && (
          <div className="flex items-center gap-2">
            <Chip>{statusCfg.label}</Chip>
          </div>
        )}
      </Surface>

      <Card className="border p-6">
        <Form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <TextField {...field} isInvalid={fieldState.invalid}>
                <Label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Name
                </Label>
                <Input variant="secondary" />
                <FieldError className="mt-1 text-xs text-red-400">
                  {fieldState.error?.message}
                </FieldError>
              </TextField>
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field, fieldState }) => (
              <TextField {...field} isInvalid={fieldState.invalid}>
                <Label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Description
                </Label>
                <TextArea variant="secondary" />
                <FieldError className="mt-1 text-xs text-red-400">
                  {fieldState.error?.message}
                </FieldError>
              </TextField>
            )}
          />

          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <CategorySelect value={field.value} onChange={field.onChange} />
            )}
          />

          <Controller
            control={control}
            name="tagIds"
            render={({ field, fieldState }) => (
              <TagSelect
                error={fieldState.error?.message}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <div className="flex gap-2">
            <Controller
              control={control}
              name="basePrice"
              render={({ field, fieldState }) => (
                <NumberField
                  variant="secondary"
                  fullWidth
                  value={field.value}
                  onChange={field.onChange}
                  isInvalid={fieldState.invalid}
                  isRequired
                  minValue={0.01}
                  // formatOptions={{
                  //   style: "decimal",
                  //   minimumFractionDigits: 2,
                  //   maximumFractionDigits: 2,
                  // }}
                >
                  <Label>Base price (USD)</Label>
                  <NumberField.Group>
                    <NumberField.DecrementButton />
                    <NumberField.Input placeholder="0.00" />
                    <NumberField.IncrementButton />
                  </NumberField.Group>
                  <Description>
                    {hasVariants
                      ? "Variants can override this price individually."
                      : "The price customers pay."}
                  </Description>
                  <FieldError>{fieldState.error?.message}</FieldError>
                </NumberField>
              )}
            />

            {!hasVariants && (
              <>
                <Controller
                  control={control}
                  name="stock"
                  render={({ field, fieldState }) => (
                    <NumberField
                      variant="secondary"
                      fullWidth
                      value={field.value}
                      onChange={field.onChange}
                      isInvalid={fieldState.invalid}
                      minValue={0}
                      formatOptions={{ maximumFractionDigits: 0 }}
                    >
                      <Label>Stock quantity</Label>
                      <NumberField.Group>
                        <NumberField.DecrementButton />
                        <NumberField.Input />
                        <NumberField.IncrementButton />
                      </NumberField.Group>
                      <Description>
                        Set to 0 to mark as out of stock.
                      </Description>
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </NumberField>
                  )}
                />
              </>
            )}
          </div>

          <Controller
            control={control}
            name="images"
            render={({ field, fieldState }) => (
              <div className="flex flex-col gap-1.5">
                <MultiImageUploader
                  value={field.value}
                  onChange={field.onChange}
                  maxFiles={10}
                  maxSize={4}
                  disabled={isSubmitting}
                />
                {fieldState.error && (
                  <p className="text-xs text-[--danger]">
                    {fieldState.error.message ?? fieldState.error.root?.message}
                  </p>
                )}
              </div>
            )}
          />

          {hasVariants && (
            <Alert color="primary" className="border-border border shadow-none">
              Stock and pricing are managed per variant
            </Alert>
          )}

          <Controller
            control={control}
            name="hasVariants"
            render={({ field }) => (
              <Switch isSelected={field.value} onChange={field.onChange}>
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
                <Switch.Content>
                  <Label className="text-sm">Enable Variants</Label>
                </Switch.Content>
              </Switch>
            )}
          />

          {hasVariants && (
            <VariantBuilder setValue={setValue} control={control} />
          )}

          <Separator />
          <Card.Footer>
            <div className="flex w-full items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {isEdit && onStatusChange && (
                  <>
                    {currentStatus !== "active" && (
                      <Button
                        size="sm"
                        variant="tertiary"
                        isPending={isSubmitting}
                        onPress={() => onStatusChange("active")}
                      >
                        {({ isPending }) => (
                          <>
                            {isPending ? (
                              <Spinner color="accent" size="sm" />
                            ) : null}
                            Publish
                          </>
                        )}
                      </Button>
                    )}
                    {currentStatus === "active" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        isPending={isSubmitting}
                        onPress={() => onStatusChange("draft")}
                      >
                        {({ isPending }) => (
                          <>
                            {isPending ? (
                              <Spinner color="accent" size="sm" />
                            ) : null}
                            Unpublish
                          </>
                        )}
                      </Button>
                    )}
                    {currentStatus !== "archived" && (
                      <Button
                        size="sm"
                        variant="outline"
                        isPending={isSubmitting}
                        onPress={() => onStatusChange("archived")}
                      >
                        {({ isPending }) => (
                          <>
                            {isPending ? <Spinner size="sm" /> : null}
                            Archive
                          </>
                        )}
                      </Button>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isEdit && (
                  <DeleteProduct
                    isEdit={isEdit}
                    productId={props.productId}
                    vendorId={props.vendorId}
                    status={props.currentStatus}
                    trigger={
                      <Button fullWidth size="sm" variant="danger-soft">
                        Delete Product
                      </Button>
                    }
                  />
                )}

                <Button
                  type="submit"
                  size="sm"
                  isPending={isSubmitting}
                  // isDisabled={false || (!isDirty && isEdit)}
                >
                  {({ isPending }) => (
                    <>
                      {isPending ? <Spinner color="warning" size="sm" /> : null}
                      {isEdit ? "Save changes" : "Create product"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card.Footer>
        </Form>
      </Card>
    </div>
  );
};

export default ProductForm;
