import { LucideIcon } from "lucide-react";
import { FieldPath, FieldValues } from "react-hook-form";
import { FormItemWrapper } from "@/components/form/FormItemWrapper";
import { TemplateFormItemProps } from "@/components/form/TemplateFormItem";
import { StarButton } from "@/components/shared/StarButton";
import { cn } from "@/lib/utils";

export function RatingField<T extends FieldValues, K extends FieldPath<T>>({
  fieldModel,
  field,
  className,
  isForm = true,
  labelCls,
}: TemplateFormItemProps<T, K>) {
  return (
    <FormItemWrapper
      name={fieldModel.name}
      desc={fieldModel.desc}
      isForm={isForm}
      className={cn(className, "space-y-3 py-4")}
      labelCls={labelCls}
      icon={fieldModel.icon as LucideIcon}
    >
      <StarButton max={fieldModel.max} onChange={field.onChange} value={field.value} />
    </FormItemWrapper>
  );
}
