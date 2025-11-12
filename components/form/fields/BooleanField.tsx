import { LucideIcon } from "lucide-react";
import { FieldPath, FieldValues } from "react-hook-form";
import { FormItemWrapper } from "@/components/form/FormItemWrapper";
import { TemplateFormItemProps } from "@/components/form/TemplateFormItem";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export function BooleanField<T extends FieldValues, K extends FieldPath<T>>({
  fieldModel,
  field,
  className,
  isForm = true,
  labelPosition = "left",
  labelCls,
}: TemplateFormItemProps<T, K>) {
  return (
    <FormItemWrapper
      name={fieldModel.name}
      desc={fieldModel.desc}
      isForm={isForm}
      className={cn(className, labelPosition === "left" ? "flex flex-1 items-center" : "flex-1")}
      labelCls={labelCls}
      icon={fieldModel.icon as LucideIcon}
    >
      <div className="relative flex items-center justify-center">
        <Switch
          {...field}
          checked={field.value}
          onCheckedChange={field.onChange}
          id={fieldModel.name}
        />
      </div>
    </FormItemWrapper>
  );
}
