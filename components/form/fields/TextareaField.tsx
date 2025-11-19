import { LucideIcon } from "lucide-react";
import { FieldPath, FieldValues } from "react-hook-form";
import { FormItemWrapper } from "@/components/form/FormItemWrapper";
import { TemplateFormItemProps } from "@/components/form/TemplateFormItem";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function TextareaField<T extends FieldValues, K extends FieldPath<T>>({
  fieldModel,
  field,
  className,
  isForm = true,
  labelPosition = "top",
  labelCls,
}: TemplateFormItemProps<T, K>) {
  return (
    <FormItemWrapper
      name={fieldModel.name}
      desc={fieldModel.desc}
      isForm={isForm}
      className={cn(className, labelPosition === "left" ? "flex flex-1 items-center" : "flex-1")}
      labelCls={cn(labelCls)}
      icon={fieldModel.icon as LucideIcon}
    >
      <Textarea
        className="max-h-62"
        readOnly={fieldModel.readOnly}
        placeholder={fieldModel?.placeholder ?? `입력하세요.`}
        {...field}
        value={field?.value ?? ""}
      />
    </FormItemWrapper>
  );
}
