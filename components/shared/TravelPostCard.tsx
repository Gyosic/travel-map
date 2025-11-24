"use client";

import { Calendar, MapPin, MoreHorizontalIcon, Pencil, Star, Trash2Icon } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { StarButton } from "@/components/shared/StarButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import type { FileType } from "@/lib/schema/file";
// import { AnimatedTestimonials } from "@/components/ui/shadcn-io/animated-testimonials";
import { HistoryType } from "@/lib/schema/history.schema";

// const ThemeToggler = dynamic(
//   () => import("@/components/shared/ThemeToggler").then((module) => module.ThemeToggler),
//   { ssr: false },
// );
const AnimatedTestimonials = dynamic(
  () =>
    import("@/components/ui/shadcn-io/animated-testimonials").then(
      (mod) => mod.AnimatedTestimonials,
    ),
  { ssr: false },
);

interface TravelPostCardProps {
  history: HistoryType;
  onDelete?: () => void;
}

export function TravelPostCard({ history, onDelete }: TravelPostCardProps) {
  const router = useRouter();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const session = useSession();

  const onDeleteItem = async (id: string) => {
    if (session.status !== "authenticated") {
      const histories = JSON.parse(localStorage.getItem("histories") || "[]");
      const newHistories = histories.filter((history: HistoryType) => history._id !== id);
      localStorage.setItem("histories", JSON.stringify(newHistories));

      toast.success("삭제에 성공했습니다.");
    } else {
      const res = await fetch(`/api/histories/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) toast.error(await res.text());
      else toast.success("삭제에 성공했습니다.");
    }

    setOpenDeleteDialog(false);

    onDelete?.();
  };

  const handleUpdate = () => {
    if (session.status !== "authenticated") {
      toast.error("로그인이 필요합니다.");
    } else router.push(`/post/${history._id}`);
  };
  return (
    <Card className="relative overflow-hidden">
      <div className="relative h-64 w-full overflow-hidden">
        <AnimatedTestimonials
          className="h-full w-full bg-background/50 p-0 dark:bg-background-foreground/50"
          testimonials={
            history?.images?.map((image) => ({ src: `/api/files/${(image as FileType).src}` })) ??
            []
          }
          autoplay
          autoplayInterval={5000}
          enableBtn={false}
        />
      </div>

      <CardHeader>
        <div className="flex flex-col">
          <div className="flex items-start justify-between">
            <h3 className="mb-2 text-primary">{history.title}</h3>
            <StarButton value={history?.rating ?? 0} readonly={true} />
          </div>

          <div className="flex w-full flex-wrap items-center justify-between gap-4 text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{history.address}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{history.date}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative w-full">
        <p className="text-muted-foreground">{history.content}</p>
      </CardContent>
      {!!history?.tags?.length && (
        <>
          <Separator />
          <CardContent className="relative w-full">
            <div className="flex flex-col items-center gap-2">
              <div className="flex w-full flex-wrap gap-2">
                {history.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </>
      )}

      {/* <CardFooter className="border-t pt-4">
        <span className="text-muted-foreground">작성자: {post.author}</span>
      </CardFooter> */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="absolute top-0 right-0">
          <Button variant="ghost" size="icon">
            <MoreHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="bottom">
          <DropdownMenuItem onClick={handleUpdate}>
            <Pencil className="h-4 w-4" />
            <span>수정</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setOpenDeleteDialog(true)}>
            <Trash2Icon className="h-4 w-4" />
            <span>삭제</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="flex justify-start text-start">
            <DialogTitle>삭제</DialogTitle>
            <DialogDescription>
              삭제한 데이터는 복구할 수 없습니다. 삭제하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpenDeleteDialog(false)}>
                취소
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  onDeleteItem(history._id);
                }}
              >
                확인
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
