"use client";

import TravelMap from "@/components/shared/TravelMap";

export default function Home() {
  return (
    <div className="flex h-full w-full flex-1 flex-col">
      <TravelMap className="flex-1" />
    </div>
  );
}
