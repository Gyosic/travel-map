"use client";

import { ColumnDataType } from "drizzle-orm";
import { ArrowLeftIcon, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Combobox from "@/components/shared/Combobox";
import { TravelPostCard } from "@/components/shared/TravelPostCard";
import { Button } from "@/components/ui/button";
import { useSido } from "@/hooks/use-sido";
import { QueryParams } from "@/lib/pg";
import { HistoryType } from "@/lib/schema/history.schema";

interface FeedProps {
  sido_cd?: string;
}
export function Feed({ sido_cd }: FeedProps) {
  const router = useRouter();
  const session = useSession();
  const { sidoList } = useSido();
  const [data, setData] = useState<{ rows: HistoryType[]; rowCount: number }>({
    rows: [],
    rowCount: 0,
  });
  const [pagination, setPagination] = useState<{ pageIndex: number; pageSize: number }>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [sido, setSido] = useState<string | undefined>(sido_cd);
  const filter = useMemo(() => {
    const condition: QueryParams<HistoryType> = {
      where: [],
      sort: [
        { id: "date", desc: true },
        { id: "created_at", desc: true },
      ],
      pagination,
    };

    if (sido)
      condition.where?.push({ field: "sido_cd", operator: "eq", value: sido as ColumnDataType });

    return condition;
  }, [sido, pagination]);

  const getHistories = useCallback(async () => {
    const response = await fetch("/api/histories", {
      method: "POST",
      body: JSON.stringify(filter),
    });

    const data = await response.json();

    setData(data);
  }, [filter]);

  const handleViewMore = async () => {
    const newPagination = { ...pagination, pageIndex: pagination.pageIndex + 1 };
    const newFilter = { ...filter, pagination: newPagination };

    const response = await fetch("/api/histories", {
      method: "POST",
      body: JSON.stringify(newFilter),
    });

    const data = await response.json();

    setData((prev) => ({ ...prev, rows: prev.rows.concat(data.rows) }));

    setPagination(newPagination);
  };

  const onDelete = async () => {
    const newPagination = { ...pagination, pageIndex: 0 };
    const newFilter = { ...filter, pagination: newPagination };

    const response = await fetch("/api/histories", {
      method: "POST",
      body: JSON.stringify(newFilter),
    });

    const data = await response.json();

    setData(data);

    setPagination(newPagination);
  };

  useEffect(() => {
    if (session.status === "authenticated") getHistories();
    else {
      const localHistories = JSON.parse(localStorage.getItem("histories") || "[]");
      setData({ rows: localHistories, rowCount: localHistories.length });
    }
  }, [session, sido]);
  useEffect(() => {
    console.info(data);
  }, [data]);
  return (
    <section className="container mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeftIcon />
        </Button>
        <div className="flex justify-between gap-2">
          <div className="flex flex-col">
            <h3 className="font-semibold text-2xl">여행 피드</h3>
            <p className="mt-1 text-muted-foreground text-sm">아름다웠던 추억을 회상해 보세요.</p>
          </div>
          <Combobox
            items={sidoList}
            value={sido}
            onValueChange={(value) => setSido(value as string)}
            placeholder="전체"
          />
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {data.rows.map((history, index) => (
            <TravelPostCard key={history?._id ?? index} history={history} onDelete={onDelete} />
          ))}
          {data.rows.length < data.rowCount && <Button onClick={handleViewMore}>더보기</Button>}
        </div>

        {data.rowCount === 0 && (
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
