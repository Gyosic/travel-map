"use client";
import { Eye, EyeClosed, LucideIcon } from "lucide-react";
import { useState } from "react";
import { FieldPath, FieldValues } from "react-hook-form";
import { FormItemWrapper } from "@/components/form/FormItemWrapper";
import { TemplateFormItemProps } from "@/components/form/TemplateFormItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function PasswordField<T extends FieldValues, K extends FieldPath<T>>({
  fieldModel,
  field,
  isForm = true,
  className,
  labelPosition = "top",
  labelCls,
}: TemplateFormItemProps<T, K>) {
  const [visiblePassword, setVisiblePassword] = useState<boolean>(false);

  return (
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
          type={visiblePassword ? "text" : "password"}
          placeholder={fieldModel?.placeholder ?? `입력하세요.`}
          {...field}
          value={field?.value ?? ""}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hover:bg-[#4fc3f7]/30"
          onClick={() => setVisiblePassword((prev) => !prev)}
        >
          {visiblePassword ? <Eye /> : <EyeClosed />}
        </Button>
      </div>
    </FormItemWrapper>
  );
}
