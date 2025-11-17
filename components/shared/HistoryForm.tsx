import { zodResolver } from "@hookform/resolvers/zod";
import { isNil, reduce } from "es-toolkit/compat";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { DaumPostcodeData } from "@/components/form/fields/AddressField";
import { TemplateFormItem } from "@/components/form/TemplateFormItem";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormField } from "@/components/ui/form";
import { useHistory } from "@/hooks/use-history";
import { guid } from "@/lib/randomize";
import { HistoryFormType, historyFormModel, historyFormSchema } from "@/lib/schema/history.schema";
import { cn } from "@/lib/utils";

interface HistoryFormProps {
  className?: string;
  isDialog?: boolean;
}
export default function HistoryForm({ className, isDialog = false }: HistoryFormProps) {
  const [open, setOpen] = useState(false);

  function FormComponent({ className }: { className?: string }) {
    const session = useSession();
    const { histories, setHistory } = useHistory();
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

    const { handleSubmit } = form;

    const onSubmit = handleSubmit(
      async (inputs: HistoryFormType) => {
        console.info("@@INPUT@@", inputs);
        if (session.status === "unauthenticated") {
          setHistory([
            ...histories,
            { ...inputs, _id: guid({ length: 11 }), user_id: guid({ length: 11 }) },
          ]);
          setOpen(false);
          return;
        }

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

        setOpen(false);
      },
      (invalid) => console.info(invalid),
    );

    const addressOncomplete = (data: DaumPostcodeData) => {
      form.setValue("sgg_cd", data.sigunguCode);
      form.setValue("emd_cd", data.bcode);
    };

    useEffect(() => {
      if (session.status === "authenticated") {
        form.setValue("user_id", session?.data?.user?.id!);
      }
    }, [session]);

    return (
      <Form {...form}>
        <form onSubmit={onSubmit} className={cn("w-full space-y-8", className)}>
          <div className="flex w-full flex-col gap-2">
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
          <div className="flex w-full items-center gap-2">
            <Button className="flex-1" type="submit">
              등록
            </Button>
          </div>
        </form>
      </Form>
    );
  }

  return isDialog ? (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost">
          <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>여행지 추가</DialogTitle>
          <DialogDescription>다녀왔던 여행지를 기록해 보세요.</DialogDescription>
        </DialogHeader>
        <FormComponent className={className} />
      </DialogContent>
    </Dialog>
  ) : (
    <FormComponent className={className} />
  );
}
