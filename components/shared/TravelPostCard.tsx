"use client";

import { Calendar, MapPin, Star } from "lucide-react";
import dynamic from "next/dynamic";
import { StarButton } from "@/components/shared/StarButton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
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
}

export function TravelPostCard({ history }: TravelPostCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-64 w-full overflow-hidden">
        <AnimatedTestimonials
          className="h-full w-full bg-background/50 p-0 dark:bg-background-foreground/50"
          testimonials={history?.images?.map((image) => ({ src: `/api/files/${image}` })) ?? []}
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

      <CardContent>
        <p className="text-muted-foreground">{history.content}</p>
      </CardContent>

      {/* <CardFooter className="border-t pt-4">
        <span className="text-muted-foreground">작성자: {post.author}</span>
      </CardFooter> */}
    </Card>
  );
}
