"use client";

import { MapPinned, ScrollText } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";

interface FooterNavbarProps {
  className?: string;
}
export function FooterNavbar({ className }: FooterNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isFeedPage = pathname.includes("/feed");
  const isHomePage = pathname === "/";

  const onClickMap = () => {
    router.push("/");
  };

  const onClickList = () => {
    router.push("/feed");
  };

  return (
    <ButtonGroup
      className={cn("sticky bottom-0 z-50 flex w-full rounded-0 bg-background", className)}
    >
      <Button
        type="button"
        variant="ghost"
        className={cn(
          "flex flex-1 flex-col items-center justify-center py-10",
          isHomePage && "bg-primary text-primary-foreground",
        )}
        onClick={() => onClickMap()}
        disabled={isHomePage}
      >
        <MapPinned className={cn("size-6", isHomePage && "text-primary-foreground")} />
        <span className="text-xs">지도</span>
      </Button>
      <ButtonGroupSeparator />
      <Button
        type="button"
        variant="ghost"
        className={cn(
          "flex flex-1 flex-col items-center justify-center py-10",
          isFeedPage && "bg-primary text-primary-foreground",
        )}
        onClick={() => onClickList()}
        disabled={isFeedPage}
      >
        <ScrollText className={cn("size-6", isFeedPage && "text-primary-foreground")} />
        <span className="text-xs">리스트</span>
      </Button>
    </ButtonGroup>
  );
}
