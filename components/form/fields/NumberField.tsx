import { isNil } from "es-toolkit/compat";
import { LucideIcon, X } from "lucide-react";
import { FieldPath, FieldValues } from "react-hook-form";
import { FormItemWrapper } from "@/components/form/FormItemWrapper";
import { TemplateFormItemProps } from "@/components/form/TemplateFormItem";
import { InputRange } from "@/components/shared/InputRange";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

const operatorList = [
  { operator: "lt", label: "미만" },
  { operator: "lte", label: "이하" },
  { operator: "gt", label: "초과" },
  { operator: "gte", label: "이상" },
];

export function NumberField<T extends FieldValues, K extends FieldPath<T>>({
  fieldModel,
  field,
  className,
  isForm = true,
  labelPosition = "top",
  labelCls,
}: TemplateFormItemProps<T, K>) {
  const enableRadioGroup = operatorList.some(({ operator }) => fieldModel?.[operator]);

  if (!!fieldModel.range)
    return (
      <FormItemWrapper
        name={fieldModel.name}
        desc={fieldModel.desc}
        isForm={isForm}
        className={cn(className, labelPosition === "left" ? "flex flex-1 items-center" : "flex-1")}
        labelCls={labelCls}
        icon={fieldModel.icon as LucideIcon}
      >
        <InputRange
          type="number"
          placeholder={fieldModel?.placeholder ?? `입력하세요.`}
          {...field}
          value={field?.value}
        />
      </FormItemWrapper>
    );
  return (
    <>
      <FormItemWrapper
        name={fieldModel.name}
        desc={fieldModel.desc}
        isForm={isForm}
        className={cn(className, labelPosition === "left" ? "flex flex-1 items-center" : "flex-1")}
        labelCls={labelCls}
        icon={fieldModel.icon as LucideIcon}
      >
        <div className="relative flex w-full items-center gap-2">
          <Input
            type="number"
            placeholder={fieldModel?.placeholder ?? `입력하세요.`}
            {...field}
            value={field?.value ?? ""}
            min={fieldModel?.min}
            max={fieldModel?.max}
            step={fieldModel?.step}
            onChange={(e) =>
              field.onChange({ ...e, target: { ...e.target, value: Number(e.target.value) } })
            }
          />
          {!isNil(field.value) && field.value !== "" && (
            <Button
              variant="ghost"
              type="button"
              className="absolute top-0 right-8 hover:bg-transparent hover:text-destructive"
              onClick={() => field.onChange(undefined)}
            >
              <X />
            </Button>
          )}
        </div>
      </FormItemWrapper>
      {enableRadioGroup && (
        <RadioGroup className="mt-2 flex items-center">
          <div className="flex items-center gap-1">
            <RadioGroupItem value={field.name + ":eq"} id={field.name + ":eq"} />
            <Label htmlFor={field.name + ":eq"}>일치</Label>
          </div>
          {operatorList.map(({ operator, label }) =>
            fieldModel?.[operator] ? (
              <div key={field.name + ":" + operator} className="flex items-center gap-1">
                <RadioGroupItem
                  value={field.name + ":" + operator}
                  id={field.name + ":" + operator}
                />
                <Label htmlFor={field.name + ":" + operator}>{label}</Label>
              </div>
            ) : null,
          )}
        </RadioGroup>
      )}
    </>
  );
}
