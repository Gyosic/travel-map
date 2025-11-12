"use client";
import { cloneDeep, omit } from "es-toolkit/compat";
import { LucideIcon, Plus, Trash } from "lucide-react";
import { Fragment } from "react";
import { FieldPath, FieldValues } from "react-hook-form";
import { FormItemWrapper } from "@/components/form/FormItemWrapper";
import { TemplateFormItemProps } from "@/components/form/TemplateFormItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { guid } from "@/lib/randomize";

export function RecordField<T extends FieldValues, K extends FieldPath<T>>({
  fieldModel,
  field,
  isForm = true,
  labelPosition = "top",
  labelCls,
}: TemplateFormItemProps<T, K>) {
  const handlePlusKey = () => {
    const newKey = guid({ length: 11 });
    field.onChange({ ...(field?.value || {}), [newKey]: "" });
  };
  const handleDeleteKey = (key: string) => {
    const newFieldValue = omit(field?.value || {}, key);
    field.onChange(newFieldValue);
  };

  //   useEffect(() => {
  //     if (!Object.keys(field?.value || {}).length) handlePlusKey();
  //   }, [field?.value]);

  return (
    <FormItemWrapper
      name={fieldModel.name}
      desc={fieldModel.desc}
      isForm={isForm}
      className={labelPosition === "left" ? "flex flex-1 items-center" : "flex-1"}
      labelCls={labelCls}
      icon={fieldModel.icon as LucideIcon}
    >
      <div className="flex w-full flex-col gap-2">
        {!Object.entries(field?.value || {}).length ? (
          <Button
            type="button"
            variant="outline"
            className="w-full text-xs"
            onClick={() => handlePlusKey()}
          >
            <Plus /> 생성
          </Button>
        ) : (
          Object.entries(field?.value || {}).map(([key, value], index) => (
            <Fragment key={index}>
              <div className="flex items-center gap-2">
                <Input
                  value={key}
                  onChange={(e) => {
                    const newKey = e.target.value;
                    const newFieldValue = Object.entries(field.value).map(([key, value], i) => {
                      if (i === index) return [newKey, value];
                      return [key, value];
                    });
                    field.onChange(Object.fromEntries(newFieldValue));
                  }}
                />{" "}
                :
                <Input
                  value={String(value)}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    const copiedFieldValue = cloneDeep(field.value);
                    copiedFieldValue[key] = newValue;

                    field.onChange(copiedFieldValue);
                  }}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteKey(key)}
                >
                  <Trash />
                </Button>
                {index === 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handlePlusKey()}
                  >
                    <Plus />
                  </Button>
                ) : (
                  <Button type="button" variant="ghost" size="icon" disabled />
                )}
              </div>
            </Fragment>
          ))
        )}
      </div>
    </FormItemWrapper>
  );
}
