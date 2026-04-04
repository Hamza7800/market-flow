import type {
  CreateProductSchema,
  ProductVariantSchema,
} from "@/zod-schema/product-schema";
import {
  Button,
  FieldError,
  Input,
  Label,
  NumberField,
  Separator,
  TextArea,
  TextField,
} from "@heroui/react";
import { GripVerticalIcon, TrashIcon, XIcon } from "lucide-react";
import {
  Controller,
  useFieldArray,
  useFormState,
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormReturn,
  type UseFormSetValue,
} from "react-hook-form";

type Props = {
  // variantsForm: UseFormReturn<CreateProductSchema['variants']>;
  control: Control<CreateProductSchema>;
  setValue: UseFormSetValue<CreateProductSchema>;
};

export const emptyVariant = (): ProductVariantSchema => ({
  name: "",
  options: { "": "" },
  price: undefined,
  stock: 0,
  sku: "",
  imageUrl: "",
});

export const VariantBuilder = ({ control, setValue }: Props) => {
  const { errors } = useFormState({ control });
  const { append, remove, fields } = useFieldArray<
    CreateProductSchema,
    "variants"
  >({
    control,
    name: "variants",
  });

  const variants =
    useWatch({
      control,
      name: "variants",
    }) ?? [];

  const onAppend = (v?: Partial<ProductVariantSchema>) => {
    append({ ...emptyVariant(), ...v });
  };

  const onRemove = (index: number) => {
    remove(index);
  };

  const variantErrors = errors.variants as
    | FieldErrors<ProductVariantSchema>[]
    | undefined;

  return (
    <div className="space-y-3">
      {fields.length === 0 ? (
        <div className="border-border bg-surface/50 flex flex-col items-center justify-center rounded-xl border border-dashed py-10 text-center">
          <p className="text-foreground text-sm font-medium">No variants yet</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Add variants for size, color, material, etc.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {fields.map((field, index) => {
            // // const isOpen = expanded.has(index);
            // const variantName =
            //   useWatch({
            //     control,
            //     name: `variants.${index}.name`,
            //   }) || `Variant ${index + 1}`;
            const variantName = variants[index]?.name || `Variant ${index + 1}`;
            const variantError = variantErrors?.[index];

            return (
              <div
                key={field.id}
                className={[
                  "overflow-hidden rounded-xl border transition-colors",
                  variantError
                    ? "border-danger/50 bg-danger/5"
                    : "border-border bg-surface",
                ].join(" ")}
              >
                {/* Row header */}
                <div className="flex items-center gap-2 px-3 py-2.5">
                  <button
                    type="button"
                    // onClick={() => toggleExpand(index)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <span className="text-foreground truncate text-sm font-medium">
                      {variantName}
                    </span>
                    {variantError && (
                      <span className="bg-danger/15 text-danger shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium">
                        Fix errors
                      </span>
                    )}
                    {/* {isOpen ? (
                      <ChevronUpIcon className="text-muted-foreground ml-auto h-4 w-4 shrink-0" />
                    ) : (
                      <ChevronDownIcon className="text-muted-foreground ml-auto h-4 w-4 shrink-0" />
                    )} */}
                  </button>

                  <Button
                    variant="danger-soft"
                    size="sm"
                    isIconOnly
                    onPress={() => onRemove(index)}
                    // className="text-muted-foreground hover:text-danger h-7 w-7 shrink-0"
                    aria-label={`Remove variant ${index + 1}`}
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Expanded body */}
                {/* {isOpen && ( */}
                <>
                  <Separator />
                  <div className="space-y-4 p-3">
                    {/* Variant name */}
                    <Controller
                      control={control}
                      name={`variants.${index}.name`}
                      render={({ field, fieldState }) => (
                        <TextField {...field} isInvalid={fieldState.invalid}>
                          <Label className="mb-1.5 block text-xs font-medium text-zinc-400">
                            Name
                          </Label>
                          <Input variant="secondary" />
                          <FieldError className="mt-1 text-xs">
                            {variantError?.name?.message}
                          </FieldError>
                        </TextField>
                      )}
                    />
                    {/* <TextField
                      isInvalid={!!variantError?.name}
                      className="w-full"
                    >
                      <Label>Variant name</Label>
                      <Input
                        {...register(`variants.${index}.name`)}
                        placeholder='e.g. "Red / Large"'
                      />
                      <FieldError>{variantError?.name?.message}</FieldError>
                    </TextField> */}

                    {/* Options (key: value pairs) */}
                    <OptionPairs
                      setValue={setValue}
                      control={control}
                      variantIndex={index}
                    />

                    {/* Price + Stock + SKU */}
                    <div className="grid grid-cols-3 gap-3">
                      <Controller
                        control={control}
                        name={`variants.${index}.price`}
                        render={({ field }) => (
                          <NumberField
                            variant="secondary"
                            value={Number(field.value) ?? undefined}
                            onChange={(v) => field.onChange(Number(v))}
                            isInvalid={!!variantError?.price}
                            formatOptions={{
                              style: "decimal",
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }}
                            minValue={0}
                            className="w-full"
                          >
                            <Label>Price ($)</Label>
                            <NumberField.Group>
                              <NumberField.DecrementButton />
                              <NumberField.Input placeholder="0.00" />
                              <NumberField.IncrementButton />
                            </NumberField.Group>
                            <FieldError>
                              {variantError?.price?.message}
                            </FieldError>
                          </NumberField>
                        )}
                      />

                      <Controller
                        control={control}
                        name={`variants.${index}.stock`}
                        render={({ field }) => (
                          <NumberField
                            variant="secondary"
                            value={field.value ?? 0}
                            onChange={field.onChange}
                            isInvalid={!!variantError?.stock}
                            minValue={0}
                            formatOptions={{ maximumFractionDigits: 0 }}
                            className="w-full"
                          >
                            <Label>Stock</Label>
                            <NumberField.Group>
                              <NumberField.DecrementButton />
                              <NumberField.Input />
                              <NumberField.IncrementButton />
                            </NumberField.Group>
                            <FieldError>
                              {variantError?.stock?.message}
                            </FieldError>
                          </NumberField>
                        )}
                      />

                      <Controller
                        control={control}
                        name={`variants.${index}.sku`}
                        render={({ field, fieldState }) => (
                          <TextField {...field} isInvalid={fieldState.invalid}>
                            <Label className="mb-1.5 block text-xs font-medium text-zinc-400">
                              SKU
                            </Label>
                            <Input variant="secondary" />
                            <FieldError className="mt-1 text-xs">
                              {variantError?.sku?.message}
                            </FieldError>
                          </TextField>
                        )}
                      />
                    </div>

                    {/* <Controller
                      control={control}
                      name={`variants.${index}.imageUrl`}
                      render={({ field, fieldState }) => (
                        <TextField {...field} isInvalid={fieldState.invalid}>
                          <Label className="mb-1.5 block text-xs font-medium text-zinc-400">
                            Image URL
                          </Label>
                          <Input variant="secondary" />
                          <FieldError className="mt-1 text-xs">
                            {variantError?.imageUrl?.message}
                          </FieldError>
                        </TextField>
                      )}
                    /> */}
                  </div>
                </>
                {/* )} */}
              </div>
            );
          })}
        </div>
      )}

      {fields.length < 100 && (
        <Button
          variant="outline"
          size="sm"
          onPress={() => onAppend()}
          className="w-full border-dashed"
        >
          Add variant
          <span className="text-muted-foreground ml-1">
            ({fields.length}/100)
          </span>
        </Button>
      )}

      {errors.variants?.root && (
        <p className="text-danger text-xs">{errors.variants.root.message}</p>
      )}
    </div>
  );
};

function OptionPairs({
  control,
  variantIndex,
  setValue,
}: {
  setValue: UseFormSetValue<CreateProductSchema>;
  control: Control<CreateProductSchema>;
  variantIndex: number;
}) {
  // const {  setValue } = form;
  const options = useWatch({
    control,
    name: `variants.${variantIndex}.options`,
  }) as Record<string, string> | undefined;

  const pairs = Object.entries(options ?? { "": "" });

  const updatePairs = (newPairs: [string, string][]) => {
    const obj = Object.fromEntries(newPairs);

    setValue(`variants.${variantIndex}.options`, obj, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const updateKey = (index: number, newKey: string) => {
    const newPairs = pairs.map(([k, v], i) =>
      i === index ? [newKey, v] : [k, v],
    ) as [string, string][];
    updatePairs(newPairs);
  };

  const updateValue = (index: number, newVal: string) => {
    const newPairs = pairs.map(([k, v], i) =>
      i === index ? [k, newVal] : [k, v],
    ) as [string, string][];
    updatePairs(newPairs);
  };

  const addPair = () => {
    updatePairs([...pairs, ["", ""]]);
  };

  const removePair = (index: number) => {
    const newPairs = pairs.filter((_, i) => i !== index) as [string, string][];
    updatePairs(newPairs.length > 0 ? newPairs : [["", ""]]);
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-sm">
        Options{" "}
        <span className="text-muted-foreground text-xs">
          (e.g. Color: Red, Size: M)
        </span>
      </Label>
      <div className="space-y-1.5">
        {pairs.map(([key, val], i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              variant="secondary"
              value={key}
              onChange={(e) => updateKey(i, e.target.value)}
              placeholder="Color"
              className="w-1/3 text-sm"
              aria-label="Option name"
            />
            <span className="text-muted-foreground">:</span>
            <Input
              variant="secondary"
              value={val}
              onChange={(e) => updateValue(i, e.target.value)}
              placeholder="Red"
              className="flex-1 text-sm"
              aria-label="Option value"
            />
            <Button
              variant="outline"
              size="sm"
              isIconOnly
              onPress={() => removePair(i)}
              // className="text-muted-foreground hover:text-danger h-7 w-7 shrink-0"
              isDisabled={pairs.length === 1}
              aria-label="Remove option"
            >
              <XIcon className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        onPress={addPair}
        className="text-muted-foreground h-7 text-xs"
      >
        Add option
      </Button>
    </div>
  );
}
