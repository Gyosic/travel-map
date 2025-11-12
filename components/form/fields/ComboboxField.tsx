"use client";
import { LucideIcon } from "lucide-react";
import { useMemo } from "react";
import { FieldPath, FieldValues } from "react-hook-form";
import { FormItemWrapper } from "@/components/form/FormItemWrapper";
import { TemplateFormItemProps } from "@/components/form/TemplateFormItem";
import Combobox, { Item } from "@/components/shared/Combobox";
import { cn } from "@/lib/utils";

export function ComboboxField<T extends FieldValues, K extends FieldPath<T>>({
  fieldModel,
  field,
  className,
  isForm = true,
  labelPosition = "top",
  labelCls,
}: TemplateFormItemProps<T, K>) {
  const enums = useMemo(() => {
    if (fieldModel?.enums) {
      if (fieldModel.type === "hex-enum")
        return Object.entries(fieldModel.enums).map(([label, value]) => ({
          label,
          value: String(value),
        }));

      return Object.entries(fieldModel.enums).map(([label, value]) => ({ label, value }));
    }

    return [];
  }, [fieldModel?.enums]);

  return (
    <FormItemWrapper
      name={fieldModel.name}
      desc={fieldModel.desc}
      isForm={isForm}
      className={cn(className, labelPosition === "left" ? "flex flex-1 items-center" : "flex-1")}
      labelCls={labelCls}
      icon={fieldModel.icon as LucideIcon}
    >
      <Combobox
        value={field.value}
        multiple={fieldModel.multiple}
        placeholder={fieldModel.placeholder || "입력하세요"}
        readOnly={fieldModel.readOnly}
        searchInput={fieldModel.searchInput}
        items={enums as Item[]}
        className="flex-1"
        contentCls="left-0"
        onValueChange={(v) => field.onChange(v)}
        onBlur={field.onBlur}
      />
    </FormItemWrapper>
  );
}
