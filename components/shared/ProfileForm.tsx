"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { isNil } from "es-toolkit/compat";
import dynamic from "next/dynamic";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { guid } from "@/lib/randomize";
import { extensionToMime, fileSchema } from "@/lib/schema/file";

const FileInput = dynamic(() => import("@/components/shared/FileInput"), { ssr: false });

const schema = z.object({
  name: z
    .string({
      error: (issue) => (isNil(issue.input) ? "필수 입력값 입니다." : "유효하지 않은 값입니다."),
    })
    .min(1, "필수 입력값 입니다."),
  image: z.array(z.instanceof(File).or(fileSchema)).optional(),
});

interface ProfileormProps {
  user: Session["user"];
}
export function ProfileForm({ user }: ProfileormProps) {
  const accept = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
  const randomName = guid({ length: 20 });
  const { update } = useSession();
  const [profileImage, setProfileImage] = useState<File[]>();
  const [imageLoading, setImageLoading] = useState(false);
  const form = useForm({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: { name: user?.name || "" },
  });
  const { handleSubmit } = form;
  const onSubmit = handleSubmit(async (inputs) => {
    const formdata = new FormData();

    formdata.append("name", inputs.name);
    if (inputs?.image) formdata.append("image", inputs.image[0] as File);
    const res = await fetch("/api/users/profile", {
      method: "PUT",
      body: formdata,
    });

    if (!res.ok) return toast.error(await res.text());

    update();
  });

  async function urlToFile(url: string, filename: string, mimeType: string) {
    setImageLoading(false);

    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], filename, { type: mimeType });
    setProfileImage([file]);

    setImageLoading(true);
  }

  useEffect(() => {
    // 시점문제 때문에 image가 set 안되는 현상이 나타남
    //   => FileInput 컴포넌트를 이미지 로드할 때 까지 기다렸다가 렌더링 하도록 처리
    if (user.image) urlToFile(user.image, randomName, "image/png");
    else setImageLoading(true);
  }, [user]);

  useEffect(() => {
    if (profileImage?.some((image) => image instanceof File)) {
      form.setValue("image", profileImage);
    }
  }, [profileImage]);

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <div className="flex flex-col gap-2">
                <FormLabel className="w-auto">이름</FormLabel>

                <FormControl>
                  <div className="flex w-full items-center gap-2">
                    <Input className="bg-white" type="text" required {...field} />
                  </div>
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        {!!imageLoading && (
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-col gap-2">
                  <FormLabel className="w-auto">프로필 사진</FormLabel>
                  <FormControl>
                    <div className="flex w-full items-center gap-2">
                      <FileInput
                        {...field}
                        value={profileImage}
                        accept={accept.reduce((acc, ext) => {
                          Object.assign(acc, { [extensionToMime[ext]]: [`.${ext}`] });
                          return acc;
                        }, {})}
                      />
                    </div>
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Button type="submit" className="w-full">
          변경
        </Button>
      </form>
    </Form>
  );
}
