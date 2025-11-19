import { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { FieldPath, FieldValues } from "react-hook-form";
import { FormItemWrapper } from "@/components/form/FormItemWrapper";
import { TemplateFormItemProps } from "@/components/form/TemplateFormItem";
import { TagInput } from "@/components/shared/TagInput";

export function TagField<T extends FieldValues, K extends FieldPath<T>>({
  fieldModel,
  field,
  isForm = true,
  labelPosition = "top",
  labelCls,
}: TemplateFormItemProps<T, K>) {
  const [inputValue, setInputValue] = useState(field.value);

  useEffect(() => {
    const value = field?.value;
    setInputValue(value);
  }, [field]);

  return (
    <FormItemWrapper
      name={fieldModel.name}
      desc={fieldModel.desc}
      labelCls={labelCls}
      className={labelPosition === "left" ? "flex flex-1 items-center" : "flex-1"}
      isForm={isForm}
      icon={fieldModel.icon as LucideIcon}
    >
      <div className="flex w-full flex-col items-end">
        <TagInput value={inputValue} onChange={field.onChange} />
      </div>
    </FormItemWrapper>
  );
}
