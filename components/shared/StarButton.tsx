"use client";

import { Star } from "lucide-react";
import * as React from "react";

import { IconButton } from "@/components/ui/shadcn-io/icon-button";

interface StarButtonProps {
  max?: number;
  value?: number;
  readonly?: boolean;
  onChange?: (num?: number) => void;
}
export const StarButton = ({ max = 5, onChange, value, readonly = false }: StarButtonProps) => {
  const [score, setScore] = React.useState(value ?? 0);
  const number = Array.from({ length: max }, (_, index) => index + 1);
  const handleClick = (num: number) => {
    setScore(num);

    onChange?.(num);
  };

  return (
    <div className="flex">
      {number.map((num) => {
        return (
          <IconButton
            type="button"
            key={num}
            icon={Star}
            active={num <= score}
            onClick={() => !readonly && handleClick(num)}
          />
        );
      })}
    </div>
  );
};
