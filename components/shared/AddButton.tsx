"use client";

import { Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AddButton() {
  const router = useRouter();
  const pathname = usePathname();
  const isPostPage = pathname.includes("/post");

  return (
    <Button
      type="button"
      size="icon"
      className={cn(
        "fixed right-5 bottom-25 z-50 rounded-full shadow-lg",
        isPostPage && "hidden",
      )}
      onClick={() => router.push("/post")}
    >
      <Plus className="" />
    </Button>
  );
}
