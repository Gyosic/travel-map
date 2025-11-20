"use client";

import { ArrowLeftIcon, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { TravelPostCard } from "@/components/shared/TravelPostCard";
import { Button } from "@/components/ui/button";
import { HistoryType } from "@/lib/schema/history.schema";

interface FeedProps {
  histories: HistoryType[];
}
export function Feed({ histories }: FeedProps) {
  const router = useRouter();

  return (
    <section className="container mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeftIcon />
        </Button>
        <h3 className="font-semibold text-2xl">여행 피드</h3>
        <p className="mt-1 text-muted-foreground text-sm">아름다웠던 추억을 회상해 보세요.</p>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {histories.map((history) => (
            <TravelPostCard key={history._id} history={history} />
          ))}
        </div>

        {histories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <MapPin className="mb-4 h-16 w-16 text-muted-foreground/50" />
            <h3 className="mb-2">아직 여행 기록이 없습니다</h3>
            <p
              className="mb-6 cursor-pointer text-muted-foreground hover:underline"
              onClick={() => router.push("/post")}
            >
              첫 번째 여행 기록을 추가해보세요!
            </p>
          </div>
        )}
      </main>
    </section>
  );
}
