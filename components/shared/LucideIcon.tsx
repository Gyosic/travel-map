"use client";

import { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

export function useDynamicIcon(icon: string | LucideIcon | undefined) {
  const [iconComponent, setIconComponent] = useState<LucideIcon | null>(null);

  useEffect(() => {
    if (typeof icon === "string") {
      // 문자열이면 동적으로 import
      import("lucide-react")
        .then((mod) => {
          const Icon = mod[icon as keyof typeof mod] as LucideIcon;
          if (Icon) setIconComponent(Icon);
        })
        .catch();
    } else {
      // 이미 컴포넌트면 그대로 사용
      setIconComponent(icon as LucideIcon);
    }
  }, [icon]);

  return iconComponent;
}
