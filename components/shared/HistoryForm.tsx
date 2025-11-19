"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { isNil, reduce } from "es-toolkit/compat";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  DaumPostcodeData,
  VWorldGetAddressResponse,
  VWorldGetCoordResponse,
} from "@/components/form/fields/AddressField";
import { TemplateFormItem } from "@/components/form/TemplateFormItem";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { HistoryFormType, historyFormModel, historyFormSchema } from "@/lib/schema/history.schema";
import { cn } from "@/lib/utils";

interface HistoryFormProps {
  className?: string;
}

export default function HistoryForm({ className }: HistoryFormProps) {
  const session = useSession();
  const router = useRouter();

  const form = useForm<HistoryFormType>({
    resolver: zodResolver(historyFormSchema),
    defaultValues: reduce(
      Object.entries(historyFormModel),
      (acc, [key, { default: defaultValue }]) => {
        if (!isNil(defaultValue)) Object.assign(acc, { [key]: defaultValue });
        return acc;
      },
      {},
    ),
  });

  const addressOncomplete = (
    data: DaumPostcodeData & Partial<VWorldGetAddressResponse> & Partial<VWorldGetCoordResponse>,
  ) => {
    if (data.sigunguCode) form.setValue("sgg_cd", data.sigunguCode);
    if (data.bcode) form.setValue("emd_cd", data.bcode);
    if (data.point?.x && data.point?.y) form.setValue("lnglat", [data.point.x, data.point.y]);
    if (data.structure?.level4LC) {
      form.setValue("emd_cd", data.structure.level4LC);
      form.setValue("sgg_cd", data.structure.level4LC.slice(0, 5));
    }
  };

  const { handleSubmit } = form;

  const onSubmit = handleSubmit(
    async (inputs: HistoryFormType) => {
      const formdata = new FormData();

      for (const [key, value] of Object.entries(inputs)) {
        if (Array.isArray(value)) {
          if (value.every((item) => item instanceof File)) {
            value.forEach((file) => formdata.append(key, file));
          } else formdata.append(key, JSON.stringify(value));
        } else formdata.append(key, value as string);
      }

      try {
        const response = await fetch("/api/histories/create", {
          method: "POST",
          body: formdata,
        });

        if (!response.ok) return toast.error(await response.text());

        await response.json();
      } catch {
        toast.error("여행지 등록에 실패했습니다.");
      }
    },
    (invalid) => console.info(invalid),
  );

  useEffect(() => {
    if (session.status === "authenticated") {
      form.setValue("user_id", session?.data?.user?.id!);
    }
  }, [session]);

  return (
    <section className="container mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h3 className="font-semibold text-2xl">여행지 추가</h3>
        <p className="mt-1 text-muted-foreground text-sm">다녀왔던 여행지를 기록해 보세요.</p>
      </div>

      <Form {...form}>
        <form onSubmit={onSubmit} className={cn("h-full space-y-6", className)}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:grid-rows-1 sm:items-start">
            {Object.entries(historyFormModel).map(([key, model]) => {
              return (
                <FormField
                  key={key}
                  control={form.control}
                  name={key as keyof HistoryFormType}
                  render={({ field }) => (
                    <TemplateFormItem
                      fieldModel={model}
                      field={field}
                      addressOncomplete={addressOncomplete}
                    />
                  )}
                />
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row">
            <Button type="submit" className="flex-1">
              저장
            </Button>
            {/* <Button type="button" variant="outline" className="flex-1">
              임시 저장
            </Button> */}
            <Button type="button" variant="ghost" onClick={() => router.push("/")}>
              취소
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}
