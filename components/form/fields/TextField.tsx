import { Check, LucideIcon, X } from "lucide-react";
import { FieldPath, FieldValues } from "react-hook-form";
import { FormItemWrapper } from "@/components/form/FormItemWrapper";
import { TemplateFormItemProps } from "@/components/form/TemplateFormItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

const operatorsList = [
  { operator: "lt", label: "미만" },
  { operator: "lte", label: "이하" },
  { operator: "gt", label: "초과" },
  { operator: "gte", label: "이상" },
];

export function TextField<T extends FieldValues, K extends FieldPath<T>>({
  fieldModel,
  field,
  isForm = true,
  className,
  labelPosition = "top",
  labelCls,
  isDuplicate = true,
  onDuplicateCheck,
}: TemplateFormItemProps<T, K>) {
  const enableRadioGroup = operatorsList.some(({ operator }) => fieldModel?.[operator]);

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
        <div className="flex w-full items-center gap-2">
          <div className="relative flex w-full items-center gap-2">
            <Input
              readOnly={fieldModel.readOnly}
              placeholder={fieldModel?.placeholder ?? `입력하세요.`}
              {...field}
              value={field?.value ?? ""}
              onBlur={() => {
                field.onBlur();
                // fieldModel?.onBlur?.({ getValues, setError, clearErrors });
              }}
            />
            {!!field.value && (
              <Button
                variant="ghost"
                type="button"
                className="absolute top-0 right-0 hover:bg-transparent hover:text-destructive"
                onClick={() => field.onChange(undefined)}
              >
                <X />
              </Button>
            )}
          </div>
          {!!fieldModel?.unique && (
            <Button
              variant="outline"
              type="button"
              disabled={!field.value || !isDuplicate}
              onClick={() => onDuplicateCheck?.(field.name, field.value)}
            >
              {!isDuplicate && <Check />} 중복검사
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
          {operatorsList.map(({ operator, label }) =>
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
