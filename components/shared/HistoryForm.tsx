"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { isNil, reduce } from "es-toolkit/compat";
import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import {
  DaumPostcodeData,
  VWorldGetAddressResponse,
  VWorldGetCoordResponse,
} from "@/components/form/fields/AddressField";
import { TemplateFormItem } from "@/components/form/TemplateFormItem";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import {
  HistoryFormType,
  HistoryType,
  historyFormModel,
  historyFormSchema,
} from "@/lib/schema/history.schema";
import { cn } from "@/lib/utils";

interface HistoryFormProps {
  className?: string;
  user_id: string;
}
export function HistoryForm({ className, user_id }: HistoryFormProps) {
  const router = useRouter();

  const defaultValues = reduce(
    Object.entries(historyFormModel),
    (acc, [key, { default: defaultValue }]) => {
      if (!isNil(defaultValue)) Object.assign(acc, { [key]: defaultValue });
      return acc;
    },
    {},
  );

  const form = useForm<HistoryFormType>({
    resolver: zodResolver(historyFormSchema),
    defaultValues: {
      ...defaultValues,
      user_id,
    },
  });

  const addressOncomplete = (
    data: DaumPostcodeData & Partial<VWorldGetAddressResponse> & Partial<VWorldGetCoordResponse>,
  ) => {
    if (data.sigunguCode) {
      form.setValue("sgg_cd", data.sigunguCode);
      form.setValue("sido_cd", data.sigunguCode.slice(0, 2));
    }
    if (data.bcode) {
      form.setValue("emd_cd", data.bcode);
      form.setValue("sido_cd", data.bcode.slice(0, 2));
    }
    if (data.point?.x && data.point?.y) form.setValue("lnglat", [data.point.x, data.point.y]);
    if (data.structure?.level4LC) {
      form.setValue("emd_cd", data.structure.level4LC);
      form.setValue("sgg_cd", data.structure.level4LC.slice(0, 5));
      form.setValue("sido_cd", data.structure.level4LC.slice(0, 2));
    }
  };

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = handleSubmit(
    async (inputs: HistoryFormType) => {
      if (isSubmitting) return;

      const formdata = new FormData();

      for (const [key, value] of Object.entries(inputs)) {
        if (Array.isArray(value)) {
          if (value.every((item) => item instanceof File)) {
            value.filter(Boolean).forEach((file) => formdata.append(key, file));
          } else formdata.append(key, JSON.stringify(value));
        } else {
          if (!isNil(value)) formdata.append(key, value as string);
        }
      }

      try {
        const response = await fetch("/api/histories/create", {
          method: "POST",
          body: formdata,
        });

        if (!response.ok) return toast.error(await response.text());

        await response.json();

        router.back();
        toast.success("여행지 등록에 성공했습니다.");
      } catch {
        toast.error("여행지 등록에 실패했습니다.");
      }
    },
    (invalid) => console.info(invalid),
  );

  return (
    <section className="container mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeftIcon />
        </Button>

        <div className="flex flex-col">
          <h3 className="font-semibold text-2xl">여행지 추가</h3>
          <p className="mt-1 text-muted-foreground text-sm">다녀왔던 여행지를 기록해 보세요.</p>
        </div>
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
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              취소
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}

type HistoryUpdateFormType = HistoryFormType & { _id: string };
interface HistoryUpdateFormProps {
  className?: string;
  user_id: string;
  history: HistoryType;
}
export function HistoryUpdateForm({ className, user_id, history }: HistoryUpdateFormProps) {
  const router = useRouter();

  const form = useForm<HistoryUpdateFormType>({
    resolver: zodResolver(historyFormSchema.extend({ _id: z.string() })),
    defaultValues: {
      ...history,
      user_id,
    },
  });

  const addressOncomplete = (
    data: DaumPostcodeData & Partial<VWorldGetAddressResponse> & Partial<VWorldGetCoordResponse>,
  ) => {
    if (data.sigunguCode) {
      form.setValue("sgg_cd", data.sigunguCode);
      form.setValue("sido_cd", data.sigunguCode.slice(0, 2));
    }
    if (data.bcode) {
      form.setValue("emd_cd", data.bcode);
      form.setValue("sido_cd", data.bcode.slice(0, 2));
    }
    if (data.point?.x && data.point?.y) form.setValue("lnglat", [data.point.x, data.point.y]);
    if (data.structure?.level4LC) {
      form.setValue("emd_cd", data.structure.level4LC);
      form.setValue("sgg_cd", data.structure.level4LC.slice(0, 5));
      form.setValue("sido_cd", data.structure.level4LC.slice(0, 2));
    }
  };

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = handleSubmit(
    async (inputs: HistoryUpdateFormType) => {
      if (isSubmitting) return;

      const formdata = new FormData();

      for (const [key, value] of Object.entries(inputs)) {
        if (Array.isArray(value)) {
          if (value.some((item) => item instanceof File)) {
            value.filter(Boolean).forEach((file) => formdata.append(key, file as File | string));
          } else formdata.append(key, JSON.stringify(value));
        } else {
          if (!isNil(value)) formdata.append(key, value as string);
        }
      }

      try {
        const response = await fetch(`/api/histories/${inputs._id}`, {
          method: "PUT",
          body: formdata,
        });

        if (!response.ok) return toast.error(await response.text());

        await response.json();

        router.back();
        toast.success("여행지 변경에 성공했습니다.");
      } catch {
        toast.error("여행지 변경에 실패했습니다.");
      }
    },
    (invalid) => console.info(invalid),
  );

  return (
    <section className="container mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeftIcon />
        </Button>

        <div className="flex flex-col">
          <h3 className="font-semibold text-2xl">여행지 변경</h3>
          <p className="mt-1 text-muted-foreground text-sm">다녀왔던 여행지를 기록해 보세요.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={onSubmit} className={cn("h-full space-y-6", className)}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:grid-rows-1 sm:items-start">
            {Object.entries(historyFormModel).map(([key, model]) => {
              return (
                <FormField
                  key={key}
                  control={form.control}
                  name={key as keyof HistoryUpdateFormType}
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
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              취소
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}
interface UnauthHistoryFormProps {
  className?: string;
}
export function UnauthHistoryForm({ className }: UnauthHistoryFormProps) {
  type FormType = Omit<HistoryFormType, "user_id">;
  const router = useRouter();

  const defaultValues = reduce(
    Object.entries(historyFormModel),
    (acc, [key, { default: defaultValue }]) => {
      if (!isNil(defaultValue)) Object.assign(acc, { [key]: defaultValue });
      return acc;
    },
    {},
  );

  const form = useForm<FormType>({
    resolver: zodResolver(historyFormSchema.omit({ user_id: true })),
    defaultValues,
  });

  const addressOncomplete = (
    data: DaumPostcodeData & Partial<VWorldGetAddressResponse> & Partial<VWorldGetCoordResponse>,
  ) => {
    if (data.sigunguCode) {
      form.setValue("sgg_cd", data.sigunguCode);
      form.setValue("sido_cd", data.sigunguCode.slice(0, 2));
    }
    if (data.bcode) {
      form.setValue("emd_cd", data.bcode);
      form.setValue("sido_cd", data.bcode.slice(0, 2));
    }
    if (data.point?.x && data.point?.y) form.setValue("lnglat", [data.point.x, data.point.y]);
    if (data.structure?.level4LC) {
      form.setValue("emd_cd", data.structure.level4LC);
      form.setValue("sgg_cd", data.structure.level4LC.slice(0, 5));
      form.setValue("sido_cd", data.structure.level4LC.slice(0, 2));
    }
  };

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = handleSubmit(
    async (inputs: FormType) => {
      if (isSubmitting) return;

      const formdata = new FormData();

      for (const [key, value] of Object.entries(inputs)) {
        if (Array.isArray(value)) {
          if (value.every((item) => item instanceof File)) {
            value.filter(Boolean).forEach((file) => formdata.append(key, file));
          } else formdata.append(key, JSON.stringify(value));
        } else {
          if (!isNil(value)) formdata.append(key, value as string);
        }
      }

      try {
        const response = await fetch("/api/histories/create/tmp", {
          method: "POST",
          body: formdata,
        });

        if (!response.ok) return toast.error(await response.text());

        const history = await response.json();

        const localHistories = JSON.parse(localStorage.getItem("histories") || "[]");
        localHistories.unshift(history);

        localStorage.setItem("histories", JSON.stringify(localHistories));

        router.back();
        toast.error("여행지 등록에 성공했습니다. 로그인을 하지않으면 데이터가 사라질 수 있습니다.");
      } catch {
        toast.error("여행지 등록에 실패했습니다.");
      }
    },
    (invalid) => console.info(invalid),
  );

  return (
    <section className="container mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeftIcon />
        </Button>
        <div className="flex flex-col">
          <h3 className="font-semibold text-2xl">여행지 추가</h3>
          <p className="mt-1 text-muted-foreground text-sm">다녀왔던 여행지를 기록해 보세요.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={onSubmit} className={cn("h-full space-y-6", className)}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:grid-rows-1 sm:items-start">
            {Object.entries(historyFormModel).map(([key, model]) => {
              return (
                <FormField
                  key={key}
                  control={form.control}
                  name={key as keyof FormType}
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
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              취소
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}
