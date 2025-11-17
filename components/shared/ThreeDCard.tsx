"use client";
import Image from "next/image";
import { CardBody, CardContainer, CardItem } from "@/components/ui/shadcn-io/3d-card";
import { cn } from "@/lib/utils";

interface ThreeDCardProps {
  className?: string;
}
export default function ThreeDCard({ className }: ThreeDCardProps) {
  return (
    <CardContainer className={cn("inter-var", className)} containerClassName="p-0">
      <CardBody className="group/card relative h-auto w-auto rounded-xl border border-black/[0.1] bg-gray-50 p-4 sm:w-[24rem] dark:border-white/[0.2] dark:bg-black dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1]">
        <CardItem translateZ="100" className="mt-4 w-full">
          <img
            src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            height="1000"
            width="1000"
            className="h-full w-full rounded-xl object-cover group-hover/card:shadow-xl"
            alt="thumbnail"
          />
        </CardItem>
      </CardBody>
    </CardContainer>
  );
}
