import { isNil } from "es-toolkit";
import { useEffect, useState } from "react";
import { DateFormatType, date } from "@/lib/format";
import { cn } from "@/lib/utils";

type ValueType = [string | number, string | number];

const dateTypeFormat: Record<string, DateFormatType> = { date: "ymd", "datetime-local": "ymd hms" };

interface InputRangeProps extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
  inputCls?: string;
  value?: ValueType;
  onChange?: (props: ValueType | undefined) => void;
}

export function InputRange({
  className,
  inputCls,
  type,
  value,
  onChange,
  ...props
}: InputRangeProps) {
  const [inputValue, setInputValue] = useState<ValueType | undefined>(value);

  useEffect(() => {
    // props value 변경 시, 업데이트
    if (JSON.stringify(value) !== JSON.stringify(inputValue)) {
      setInputValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (isNil(inputValue)) {
      onChange?.(undefined);
      return;
    }

    let value = inputValue;

    if (Object.keys(dateTypeFormat).includes(type as string))
      value = value?.map((v) =>
        v ? date(new Date(v), { type: dateTypeFormat[type as string] }) : undefined,
      ) as ValueType;

    if (type === "number") value = value?.map((v) => Number(v)) as ValueType;

    onChange?.(value);
  }, [inputValue, type]);

  return (
    <div className={cn("flex gap-2", className)}>
      <input
        type={type}
        data-slot="input"
        className={cn(
          "flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
          "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
          inputCls,
        )}
        {...props}
        value={
          typeof inputValue?.[0] === "string" || typeof inputValue?.[0] === "number"
            ? inputValue[0]
            : ""
        }
        onChange={(e) => setInputValue([e.target.value, inputValue?.[1] || ""])}
      />
      <input
        type={type}
        data-slot="input"
        className={cn(
          "flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
          "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
          inputCls,
        )}
        {...props}
        value={
          typeof inputValue?.[1] === "string" || typeof inputValue?.[1] === "number"
            ? inputValue[1]
            : ""
        }
        onChange={(e) => setInputValue([inputValue?.[0] || "", e.target.value])}
      />
    </div>
  );
}
