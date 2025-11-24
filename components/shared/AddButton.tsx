"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AddButton() {
  const router = useRouter();
  return (
    <Button
      type="button"
      size="icon"
      className="fixed right-5 bottom-25 z-50 rounded-full shadow-lg"
      onClick={() => router.push("/post")}
    >
      <Plus className="" />
    </Button>
  );
}
