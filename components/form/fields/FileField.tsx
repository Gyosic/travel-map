import { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FieldPath, FieldValues } from "react-hook-form";
import { FormItemWrapper } from "@/components/form/FormItemWrapper";
import { TemplateFormItemProps } from "@/components/form/TemplateFormItem";
import FileInput from "@/components/shared/FileInput";
import { extensionToMime } from "@/lib/schema/file";

export function FieldField<T extends FieldValues, K extends FieldPath<T>>({
  fieldModel,
  field,
  isForm = true,
  labelPosition = "top",
  labelCls,
}: TemplateFormItemProps<T, K>) {
  const [inputValue, setInputValue] = useState(field.value);
  const accept = useMemo(() => {
    if (fieldModel?.accept)
      return fieldModel.accept.reduce((acc, ext) => {
        Object.assign(acc, { [extensionToMime[ext]]: `.${ext}` });
        return acc;
      }, {});
    return undefined;
  }, [fieldModel]);

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
        <FileInput
          multiple={fieldModel.multiple}
          value={inputValue}
          onChange={field.onChange}
          accept={accept}
        />
      </div>
    </FormItemWrapper>
  );
}
