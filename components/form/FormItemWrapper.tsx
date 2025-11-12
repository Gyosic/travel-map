"use client";

import type { LucideIcon } from "lucide-react";
import { createElement } from "react";
import { useDynamicIcon } from "@/components/shared/LucideIcon";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

interface FormItemWrapperProps {
  children: React.ReactNode;
  isForm: boolean;
  name: string;
  desc?: string;
  labelCls?: string;
  className?: string;
  formLabel?: React.ReactNode;
  icon?: LucideIcon | string;
}

export function FormItemWrapper({
  children,
  name,
  desc,
  labelCls,
  isForm,
  className,
  formLabel,
  icon,
}: FormItemWrapperProps) {
  const iconComponent = useDynamicIcon(icon);

  if (!isForm) return <>{children}</>;

  return (
    <FormItem className={cn(className)}>
      {!!formLabel ? (
        formLabel
      ) : (
        <FormLabel className={cn(labelCls)}>
          {iconComponent && createElement(iconComponent, { className: "size-4" })} {name}
        </FormLabel>
      )}
      <FormControl>{children}</FormControl>
      {desc && <FormDescription className="text-gray-500 text-xs">{desc}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
}
