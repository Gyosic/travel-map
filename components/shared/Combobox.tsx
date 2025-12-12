"use client";

import { Check, ChevronsUpDown, X } from "lucide-react";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";

export type Item = {
  label: string;
  value: string;
};
interface ComboboxProps<T extends Item> {
  items: T[];
  value?: string | string[];
  className?: string;
  contentCls?: string;
  placeholder?: string;
  label?: string;
  multiple?: boolean;
  readOnly?: boolean;
  searchInput?: boolean;
  onValueChange?: (value?: string | string[]) => void;
}
export default function Combobox<T extends Item>({
  items,
  value: _value = "",
  className = "",
  contentCls = "",
  placeholder = "선택하세요.",
  label = "",
  multiple = false,
  readOnly = false,
  searchInput = false,
  onValueChange,
}: ComboboxProps<T>) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | string[]>(multiple ? [] : "");

  useEffect(() => {
    if (value !== _value) {
      if (multiple) {
        setValue(Array.isArray(_value) ? _value : [_value].filter(Boolean));
      } else {
        setValue(_value);
      }
    }
  }, [_value]);

  useEffect(() => {
    setValue((prev) => (multiple && !Array.isArray(prev) ? [prev].filter(Boolean) : prev));
  }, [multiple]);

  const findLabel = (
    nodes: ComboboxProps<Item>["items"],
    value: string | string[],
  ): string | null => {
    if (nodes.length === 0) return null;

    if (Array.isArray(value)) {
      const labels = [];
      for (const node of nodes) {
        if (value.includes(node.value)) labels.push(node.label);
      }
      return labels.join(", ");
    } else {
      for (const node of nodes) {
        if (node.value === value) return node.label;
      }
    }
    return null;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {!!label && <Label className="ps-2">{label}</Label>}
      <PopoverTrigger className={cn(className, "truncate")} asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={readOnly}
          aria-expanded={open}
          className="justify-between"
        >
          {!!value && value.length > 0 ? (
            <span className="truncate">{findLabel(items, value)}</span>
          ) : (
            <span className="font-normal text-muted-foreground">{placeholder}</span>
          )}
          <div className="flex items-center gap-1">
            {!!value && value.length > 0 && (
              <span
                role="button"
                tabIndex={0}
                className="z-10 w-full cursor-pointer hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  setValue(multiple ? [] : "");
                  onValueChange?.();
                  setOpen(false);
                }}
              >
                <X />
              </span>
            )}
            <ChevronsUpDown className="opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(contentCls, "w-[var(--radix-popover-trigger-width)] p-0")}
        align="start"
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <Command>
          {searchInput && <CommandInput />}
          <CommandList>
            <CommandEmpty>선택할 항목이 없습니다.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={(currentValue) => {
                    setValue((prev) => {
                      if (multiple) {
                        const set = new Set(prev);
                        if (set.has(currentValue)) set.delete(currentValue);
                        else set.add(currentValue);

                        onValueChange?.(Array.from(set));
                        return Array.from(set);
                      } else {
                        onValueChange?.(currentValue === value ? prev : currentValue);
                        setOpen(false);
                        return currentValue === value ? prev : currentValue;
                      }
                    });
                  }}
                >
                  {item.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      (Array.isArray(value) ? value.includes(item.value) : value === item.value)
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
